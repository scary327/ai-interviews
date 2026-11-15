from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.db.models import Message
from app.db.session import Session
from app.schemas.evaluation import EvaluationOut
from app.schemas.messages import MessageOut, SendMessageIn
from app.services import engine, interviews, report
from app.services.interviews import CoreApi, InterviewTurn, Llm, OwnedInterview

router = APIRouter(prefix="/interviews", tags=["chat"])


@router.get("/{id}/messages", operation_id="listMessages", response_model=list[MessageOut])
async def list_messages(interview: OwnedInterview, session: Session) -> list[Message]:
    return await interviews.list_messages(session, interview.id)


@router.post("/{id}/messages", operation_id="sendMessage", response_class=StreamingResponse)
async def send_message(
    body: SendMessageIn, turn: InterviewTurn, core: CoreApi, llm: Llm
) -> StreamingResponse:
    return await engine.take_turn(turn, body.text, core, llm)


@router.post("/{id}/finish", operation_id="finishInterview", response_model=EvaluationOut)
async def finish_interview(turn: InterviewTurn, core: CoreApi, llm: Llm) -> EvaluationOut:
    return await report.finish_interview(turn, core, llm)
