from typing import Literal, Self

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", extra="ignore", hide_input_in_errors=True, env_ignore_empty=True
    )

    llm_provider: Literal["fake", "routerai"] = "fake"
    routerai_api_key: str | None = None
    routerai_base_url: str = "https://routerai.ru/api/v1"
    routerai_model: str = "deepseek/deepseek-v4.1-flash"
    db_url: str = Field(min_length=1)
    core_api_url: str = "http://localhost:8080"
    jwks_url: str = Field(min_length=1)
    internal_api_token: str = Field(min_length=1)

    @model_validator(mode="after")
    def require_routerai_key(self) -> Self:
        if self.llm_provider == "routerai" and not self.routerai_api_key:
            raise ValueError("ROUTERAI_API_KEY is required when LLM_PROVIDER=routerai")
        return self


settings = Settings()
