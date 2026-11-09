from app.config import Settings
from app.llm.base import LLMProvider
from app.llm.fake import FakeProvider
from app.llm.routerai import RouterAIProvider


def create_llm_provider(settings: Settings) -> LLMProvider:
    if settings.llm_provider == "routerai":
        return RouterAIProvider(
            api_key=settings.routerai_api_key,
            base_url=settings.routerai_base_url,
            model=settings.routerai_model,
        )
    return FakeProvider()
