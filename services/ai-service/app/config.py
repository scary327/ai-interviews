from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", hide_input_in_errors=True)

    llm_provider: Literal["fake", "routerai", "local"] = "fake"
    routerai_api_key: str | None = None
    routerai_model: str | None = None
    db_url: str = Field(min_length=1)
    core_api_url: str = "http://localhost:8080"
    jwks_url: str = Field(min_length=1)
    internal_api_token: str = Field(min_length=1)


settings = Settings()
