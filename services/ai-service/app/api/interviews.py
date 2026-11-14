from fastapi import APIRouter

from app.db.models import Message
from app.db.session import Session
from app.schemas.messages import MessageOut
from app.services import interviews
from app.services.interviews import OwnedInterview

router = APIRouter(prefix="/interviews", tags=["chat"])


@router.get("/{id}/messages", operation_id="listMessages", response_model=list[MessageOut])
async def list_messages(interview: OwnedInterview, session: Session) -> list[Message]:
    return await interviews.list_messages(session, interview.id)
