from collections.abc import AsyncGenerator, AsyncIterator, Awaitable
from dataclasses import dataclass
from typing import Annotated, TypeVar
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import CurrentUserId
from app.clients.core_api import CoreApiClient, InterviewInfo
from app.db.lock import advisory_lock
from app.db.models import Evaluation, InterviewPlan, Message
from app.db.session import SessionFactory
from app.llm.base import LLMProvider
from app.llm.errors import LLMError, LLMUnavailable

NOT_FOUND = "Собеседование не найдено"

T = TypeVar("T")


def core_api(request: Request) -> CoreApiClient:
    return request.app.state.core_api


def llm_provider(request: Request) -> LLMProvider:
    return request.app.state.llm


CoreApi = Annotated[CoreApiClient, Depends(core_api)]
Llm = Annotated[LLMProvider, Depends(llm_provider)]


async def owned_interview(id: UUID, user_id: CurrentUserId, core: CoreApi) -> InterviewInfo:
    interview = await core.get_interview(id)
    if interview is None or interview.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=NOT_FOUND)
    return interview


OwnedInterview = Annotated[InterviewInfo, Depends(owned_interview)]


@dataclass
class Turn:
    interview_id: UUID
    candidate_message_id: UUID | None = None
    reply: AsyncGenerator[str, None] | None = None
    completed: bool = False


async def interview_turn(interview: OwnedInterview) -> AsyncIterator[Turn]:
    async with advisory_lock(f"interview:{interview.id}") as locked:
        if not locked:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Подождите — предыдущее действие ещё выполняется",
            )
        turn = Turn(interview.id)
        try:
            yield turn
        finally:
            try:
                if not turn.completed and turn.candidate_message_id is not None:
                    async with SessionFactory() as session:
                        await session.execute(delete(Message).where(Message.id == turn.candidate_message_id))
                        await session.commit()
            finally:
                if turn.reply is not None:
                    await turn.reply.aclose()


InterviewTurn = Annotated[Turn, Depends(interview_turn)]


@dataclass
class History:
    messages: list[Message]
    plan: InterviewPlan | None
    evaluations: list[Evaluation]


async def list_messages(session: AsyncSession, interview_id: UUID) -> list[Message]:
    result = await session.scalars(
        select(Message)
        .where(Message.interview_id == interview_id)
        .order_by(Message.created_at, Message.id)
    )
    return list(result)


async def drop_unanswered(interview_id: UUID) -> None:
    async with SessionFactory() as session:
        last = await session.scalar(
            select(Message)
            .where(Message.interview_id == interview_id)
            .order_by(Message.created_at.desc(), Message.id.desc())
            .limit(1)
        )
        if last is not None and last.role == "candidate":
            await session.delete(last)
            await session.commit()


async def load_history(interview_id: UUID) -> History:
    async with SessionFactory() as session:
        messages = await list_messages(session, interview_id)
        plan = await session.get(InterviewPlan, interview_id)
        evaluations = await session.scalars(
            select(Evaluation)
            .where(Evaluation.interview_id == interview_id)
            .order_by(Evaluation.created_at, Evaluation.id)
        )
        return History(messages, plan, list(evaluations))


def interview_info_values(interview: InterviewInfo) -> dict[str, str]:
    return {
        "position": interview.position,
        "level": interview.level,
        "topics": ", ".join(interview.topics) if interview.topics else "не указаны",
    }


def candidate_text(text: str) -> str:
    return text.replace("<", "&lt;").replace(">", "&gt;")


async def reread_interview(core: CoreApiClient, interview_id: UUID) -> InterviewInfo:
    interview = await core.get_interview(interview_id)
    if interview is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=NOT_FOUND)
    return interview


async def llm_call(awaitable: Awaitable[T], retry_hint: str) -> T:
    try:
        return await awaitable
    except LLMUnavailable as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Модель временно недоступна — {retry_hint} чуть позже",
        ) from e
    except LLMError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Не удалось получить ответ модели — {retry_hint}",
        ) from e
