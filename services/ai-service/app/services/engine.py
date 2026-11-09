import json
from collections.abc import AsyncIterator
from dataclasses import dataclass
from typing import Literal
from uuid import UUID

from fastapi import HTTPException, status
from fastapi.responses import StreamingResponse
from fastapi.sse import format_sse_event

from app.clients.core_api import CoreApiClient
from app.db.models import Evaluation, InterviewPlan, Message
from app.db.session import SessionFactory
from app.llm.base import ChatMessage, LLMProvider
from app.llm.errors import LLMError
from app.schemas.llm import PLAN_SIZE, AnswerEvaluationOut, PlanOut
from app.services.interviews import (
    History,
    Turn,
    candidate_text,
    drop_unanswered,
    interview_info_values,
    llm_call,
    load_history,
    reread_interview,
)
from app.services.prompts import render

Decision = Literal["follow_up", "next", "finish"]

RESEND_ANSWER = "отправьте ответ ещё раз"
_LAST_QUESTION = PLAN_SIZE - 1
_FORCED_FOLLOW_UP_QUESTION = PLAN_SIZE - 2
_CONTEXT_MESSAGES = 6
_PLAN_TOKENS = 800
_EVALUATION_TOKENS = 400
_REPLY_TOKENS = 400


@dataclass
class Position:
    question_index: int
    follow_up_no: int


def current_position(history: History) -> Position | None:
    if not history.evaluations:
        return Position(0, 0)
    last = history.evaluations[-1]
    if last.decision == "follow_up":
        return Position(last.question_index, 1)
    if last.decision == "next":
        return Position(last.question_index + 1, 0)
    return None


def decide(evaluation: AnswerEvaluationOut, position: Position, history: History) -> Decision:
    had_follow_up = any(e.decision == "follow_up" for e in history.evaluations)
    forced = not had_follow_up and position.question_index == _FORCED_FOLLOW_UP_QUESTION
    if position.follow_up_no == 0 and (evaluation.needs_follow_up or forced):
        return "follow_up"
    if position.question_index < _LAST_QUESTION:
        return "next"
    return "finish"


async def take_turn(
    turn: Turn, text: str, core: CoreApiClient, llm: LLMProvider
) -> StreamingResponse:
    interview = await reread_interview(core, turn.interview_id)
    if interview.status == "FINISHED":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Собеседование уже завершено")
    await drop_unanswered(turn.interview_id)
    history = await load_history(turn.interview_id)
    if interview.status == "CREATED":
        await core.start_interview(turn.interview_id)
    values = interview_info_values(interview)
    plan = history.plan or await _create_plan(turn.interview_id, values, llm)
    questions = [q["text"] for q in plan.questions]

    if not history.messages:
        evaluation = None
        instruction = (
            "Кандидат представился. Поприветствуй его, одним предложением отреагируй на рассказ "
            f"и задай первый вопрос: <question>{questions[0]}</question>"
        )
    else:
        position = current_position(history)
        if position is None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Вопросы закончились — нажмите «Завершить», чтобы получить отчёт",
            )
        answer = await _evaluate(text, position, questions, history, values, llm)
        decision = decide(answer, position, history)
        evaluation = Evaluation(
            interview_id=turn.interview_id,
            question_index=position.question_index,
            follow_up_no=position.follow_up_no,
            score=answer.score,
            comment=answer.comment,
            decision=decision,
            follow_up_question=answer.follow_up_question if decision == "follow_up" else None,
        )
        instruction = _instruction(decision, answer, position, questions)

    await _save_answer(turn, text, evaluation)
    turn.reply = llm.stream(
        _reply_messages(history, text, instruction, values), max_tokens=_REPLY_TOKENS
    )
    first = await _first_piece(turn.reply)
    return StreamingResponse(
        _events(turn, first),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


async def _create_plan(interview_id: UUID, values: dict[str, str], llm: LLMProvider) -> InterviewPlan:
    out = await llm_call(
        llm.complete_json(
            [
                {"role": "system", "content": render("plan", **values)},
                {"role": "user", "content": "Составь план собеседования."},
            ],
            schema=PlanOut,
            max_tokens=_PLAN_TOKENS,
        ),
        RESEND_ANSWER,
    )
    async with SessionFactory() as session:
        plan = InterviewPlan(interview_id=interview_id, questions=[q.model_dump() for q in out.questions])
        session.add(plan)
        await session.commit()
    return plan


async def _evaluate(
    text: str,
    position: Position,
    questions: list[str],
    history: History,
    values: dict[str, str],
    llm: LLMProvider,
) -> AnswerEvaluationOut:
    parts = [f"<question>{questions[position.question_index]}</question>"]
    if position.follow_up_no:
        messages = {m.id: m for m in history.messages}
        base = next(
            (
                e
                for e in history.evaluations
                if e.question_index == position.question_index and e.follow_up_no == 0
            ),
            None,
        )
        if base is not None and base.message_id in messages:
            parts.append(f"<first_answer>{candidate_text(messages[base.message_id].text)}</first_answer>")
        parts.append(f"<follow_up>{history.messages[-1].text}</follow_up>")
    parts.append(f"<answer>{candidate_text(text)}</answer>")
    return await llm_call(
        llm.complete_json(
            [
                {"role": "system", "content": render("evaluate", **values)},
                {"role": "user", "content": "\n".join(parts)},
            ],
            schema=AnswerEvaluationOut,
            max_tokens=_EVALUATION_TOKENS,
        ),
        RESEND_ANSWER,
    )


def _instruction(
    decision: Decision, answer: AnswerEvaluationOut, position: Position, questions: list[str]
) -> str:
    if decision == "follow_up":
        return (
            "Коротко, без оценки, отреагируй на ответ и задай уточняющий вопрос: "
            f"<question>{answer.follow_up_question}</question>"
        )
    if decision == "next":
        return (
            "Коротко, без оценки, отреагируй на ответ и задай следующий вопрос: "
            f"<question>{questions[position.question_index + 1]}</question>"
        )
    return (
        "Поблагодари кандидата, скажи, что вопросы закончились, и предложи нажать кнопку «Завершить», "
        "чтобы получить отчёт. Новых вопросов не задавай."
    )


async def _save_answer(turn: Turn, text: str, evaluation: Evaluation | None) -> None:
    async with SessionFactory() as session:
        message = Message(interview_id=turn.interview_id, role="candidate", text=text)
        session.add(message)
        await session.flush()
        if evaluation is not None:
            evaluation.message_id = message.id
            session.add(evaluation)
        await session.commit()
    turn.candidate_message_id = message.id


def _reply_messages(
    history: History, text: str, instruction: str, values: dict[str, str]
) -> list[ChatMessage]:
    messages: list[ChatMessage] = [{"role": "system", "content": render("interviewer", **values)}]
    for m in history.messages[-_CONTEXT_MESSAGES:]:
        messages.append({"role": "assistant" if m.role == "interviewer" else "user", "content": m.text})
    messages.append({"role": "user", "content": text})
    messages.append({"role": "system", "content": instruction})
    return messages


async def _first_piece(reply: AsyncIterator[str]) -> str:
    try:
        return await llm_call(anext(reply), RESEND_ANSWER)
    except StopAsyncIteration as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Не удалось получить ответ модели — {RESEND_ANSWER}",
        ) from e


def _event(name: str, payload: dict[str, str]) -> bytes:
    return format_sse_event(event=name, data_str=json.dumps(payload, ensure_ascii=False))


async def _events(turn: Turn, first: str) -> AsyncIterator[bytes]:
    pieces = [first]
    yield _event("delta", {"text": first})
    try:
        async for piece in turn.reply:
            pieces.append(piece)
            yield _event("delta", {"text": piece})
    except LLMError:
        yield _event("error", {"detail": f"Ответ интервьюера прервался — {RESEND_ANSWER}"})
        return
    text = "".join(pieces).strip()
    if not text:
        yield _event("error", {"detail": f"Интервьюер не ответил — {RESEND_ANSWER}"})
        return
    async with SessionFactory() as session:
        message = Message(interview_id=turn.interview_id, role="interviewer", text=text)
        session.add(message)
        await session.flush()
        turn.completed = True
        await session.commit()
    yield _event("done", {"messageId": str(message.id)})
