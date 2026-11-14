from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import CurrentUserId
from app.clients.core_api import CoreApiClient, InterviewOwner
from app.db.models import Message


def core_api(request: Request) -> CoreApiClient:
    return request.app.state.core_api


async def owned_interview(
    id: UUID,
    user_id: CurrentUserId,
    core: Annotated[CoreApiClient, Depends(core_api)],
) -> InterviewOwner:
    interview = await core.get_interview(id)
    if interview is None or interview.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    return interview


OwnedInterview = Annotated[InterviewOwner, Depends(owned_interview)]


async def list_messages(session: AsyncSession, interview_id: UUID) -> list[Message]:
    result = await session.scalars(
        select(Message)
        .where(Message.interview_id == interview_id)
        .order_by(Message.created_at, Message.id)
    )
    return list(result)
