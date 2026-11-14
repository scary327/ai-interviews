import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api import health, interviews
from app.clients.core_api import CoreApiClient
from app.config import settings
from app.db.session import engine
from app.llm.factory import create_llm_provider

logging.basicConfig(level=logging.WARNING)
logging.getLogger("app").setLevel(logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.core_api = CoreApiClient()
    app.state.llm = create_llm_provider(settings)
    yield
    await app.state.llm.close()
    await app.state.core_api.close()
    await engine.dispose()


app = FastAPI(title="ai-service", version="0.1.0", lifespan=lifespan)

app.include_router(health.router)
app.include_router(interviews.router)
