from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    llm_provider: Literal["fake", "routerai", "local"] = "fake"
    routerai_api_key: str | None = None
    routerai_model: str | None = None
    db_url: str | None = None
    core_api_url: str = "http://localhost:8081"
    jwks_url: str | None = None
    internal_api_token: str | None = None


settings = Settings()
