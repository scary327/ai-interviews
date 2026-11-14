import logging
from uuid import UUID

import httpx
from fastapi import HTTPException, status
from pydantic import BaseModel, Field, ValidationError

from app.config import settings

logger = logging.getLogger(__name__)


class InterviewOwner(BaseModel):
    id: UUID
    user_id: UUID = Field(alias="userId")


class CoreApiClient:
    def __init__(self) -> None:
        self._http = httpx.AsyncClient(
            base_url=settings.core_api_url,
            headers={"X-Internal-Token": settings.internal_api_token},
            timeout=5,
        )

    async def close(self) -> None:
        await self._http.aclose()

    async def get_interview(self, interview_id: UUID) -> InterviewOwner | None:
        try:
            response = await self._http.get(f"/internal/interviews/{interview_id}")
        except httpx.TransportError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Service temporarily unavailable",
            ) from e
        if response.status_code == status.HTTP_404_NOT_FOUND:
            return None
        if response.status_code != status.HTTP_200_OK:
            logger.warning(
                "core-api GET /internal/interviews/%s responded with %s", interview_id, response.status_code
            )
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Service error")
        try:
            return InterviewOwner.model_validate_json(response.content)
        except ValidationError as e:
            logger.warning("core-api GET /internal/interviews/%s returned an unexpected body", interview_id)
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Service error") from e
