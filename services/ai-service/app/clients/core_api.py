import logging
from typing import Any, Literal
from uuid import UUID

import httpx
from fastapi import HTTPException, status
from pydantic import BaseModel, Field, ValidationError

from app.config import settings
from app.schemas.evaluation import EvaluationOut

logger = logging.getLogger(__name__)

SERVICE_ERROR = "Ошибка сервиса — попробуйте позже"
SERVICE_UNAVAILABLE = "Сервис временно недоступен — попробуйте позже"


class InterviewInfo(BaseModel):
    id: UUID
    user_id: UUID = Field(alias="userId")
    position: str
    level: str
    topics: list[str] = []
    status: Literal["CREATED", "IN_PROGRESS", "FINISHED"]
    result: dict[str, Any] | None = None


class CoreApiClient:
    def __init__(self) -> None:
        self._http = httpx.AsyncClient(
            base_url=settings.core_api_url,
            headers={"X-Internal-Token": settings.internal_api_token},
            timeout=5,
        )

    async def close(self) -> None:
        await self._http.aclose()

    async def get_interview(self, interview_id: UUID) -> InterviewInfo | None:
        response = await self._send("GET", f"/internal/interviews/{interview_id}")
        if response.status_code == status.HTTP_404_NOT_FOUND:
            return None
        self._expect(response, status.HTTP_200_OK)
        try:
            return InterviewInfo.model_validate_json(response.content)
        except ValidationError as e:
            logger.warning("core-api GET /internal/interviews/%s returned an unexpected body", interview_id)
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=SERVICE_ERROR) from e

    async def start_interview(self, interview_id: UUID) -> None:
        response = await self._send("POST", f"/internal/interviews/{interview_id}/start")
        if response.status_code == status.HTTP_409_CONFLICT:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Собеседование уже завершено")
        self._expect(response, status.HTTP_204_NO_CONTENT)

    async def save_result(self, interview_id: UUID, result: EvaluationOut) -> None:
        response = await self._send(
            "PUT", f"/internal/interviews/{interview_id}/result", json=result.model_dump()
        )
        if response.status_code == status.HTTP_409_CONFLICT:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Собеседование ещё не начиналось — ответьте хотя бы на один вопрос",
            )
        if response.status_code == status.HTTP_400_BAD_REQUEST:
            logger.warning("core-api rejected the result of %s: %s", interview_id, response.text[:1000])
        self._expect(response, status.HTTP_204_NO_CONTENT)

    async def _send(self, method: str, url: str, **kwargs) -> httpx.Response:
        try:
            return await self._http.request(method, url, **kwargs)
        except httpx.TransportError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=SERVICE_UNAVAILABLE,
            ) from e

    @staticmethod
    def _expect(response: httpx.Response, expected: int) -> None:
        if response.status_code != expected:
            logger.warning(
                "core-api %s %s responded with %s",
                response.request.method,
                response.request.url.path,
                response.status_code,
            )
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=SERVICE_ERROR)
