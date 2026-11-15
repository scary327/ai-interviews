import math

from fastapi import HTTPException, status

from app.clients.core_api import CoreApiClient
from app.llm.base import LLMProvider
from app.schemas.evaluation import CriterionScore, EvaluationOut
from app.schemas.llm import ReportOut
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

_REPORT_TOKENS = 2500


async def finish_interview(turn: Turn, core: CoreApiClient, llm: LLMProvider) -> EvaluationOut:
    interview = await reread_interview(core, turn.interview_id)
    if interview.status == "FINISHED" and interview.result is not None:
        return EvaluationOut.model_validate(interview.result)
    await drop_unanswered(turn.interview_id)
    history = await load_history(turn.interview_id)
    if not history.evaluations:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ответьте хотя бы на один вопрос — тогда можно подвести итоги",
        )
    report = await llm_call(
        llm.complete_json(
            [
                {"role": "system", "content": render("report", **interview_info_values(interview))},
                {"role": "user", "content": _transcript(history)},
            ],
            schema=ReportOut,
            max_tokens=_REPORT_TOKENS,
        ),
        "нажмите «Завершить» ещё раз",
    )
    result = EvaluationOut(
        score=math.floor(sum(c.score for c in report.criteria) / len(report.criteria) + 0.5),
        summary=report.summary,
        strengths=report.strengths,
        weaknesses=report.weaknesses,
        criteria=[CriterionScore(key=c.key, score=c.score, comment=c.comment) for c in report.criteria],
        recommendations=report.recommendations,
    )
    await core.save_result(turn.interview_id, result)
    return result


def _transcript(history: History) -> str:
    evaluations = {e.message_id: e for e in history.evaluations}
    lines = ["План собеседования:"]
    lines += [f"{i + 1}. [{q['topic']}] {q['text']}" for i, q in enumerate(history.plan.questions)]
    lines.append("")
    lines.append("Диалог и оценки ответов:")
    asked = ""
    for message in history.messages:
        if message.role == "interviewer":
            asked = message.text
            continue
        evaluation = evaluations.get(message.id)
        if evaluation is None:
            lines.append(f"Кандидат представился: <answer>{candidate_text(message.text)}</answer>")
            continue
        kind = "уточнение" if evaluation.follow_up_no else "основной вопрос"
        lines.append(f"Вопрос {evaluation.question_index + 1} ({kind}). Интервьюер: {asked}")
        lines.append(f"Ответ: <answer>{candidate_text(message.text)}</answer>")
        lines.append(f"Оценка ответа: {evaluation.score}/100. {evaluation.comment}")
    return "\n".join(lines)
