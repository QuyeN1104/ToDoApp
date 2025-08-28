from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "TodoApp"
    API_PREFIX: str = "/api"

    DATABASE_URL: str = "sqlite:///./todos.db"

    JWT_SECRET: str = "dev-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRES_SECONDS: int = 3600
    REFRESH_TOKEN_EXPIRES_SECONDS: int = 60 * 60 * 24 * 30

    # Comma separated list of origins
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    def cors_origin_list(self) -> List[str]:
        raw = (self.CORS_ORIGINS or "").strip()
        if not raw:
            return []
        return [o.strip() for o in raw.split(",") if o.strip()]


settings = Settings()

