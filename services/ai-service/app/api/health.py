from fastapi import APIRouter

router = APIRouter(tags=["system"])


@router.get("/health", operation_id="health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
