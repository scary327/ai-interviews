from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api import health, interviews
from app.clients.core_api import CoreApiClient
from app.db.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.core_api = CoreApiClient()
    yield
    await app.state.core_api.close()
    await engine.dispose()


app = FastAPI(title="ai-service", version="0.1.0", lifespan=lifespan)

app.include_router(health.router)
app.include_router(interviews.router)
