import os
from pydantic_settings import BaseSettings
from dotenv import find_dotenv, load_dotenv

load_dotenv(find_dotenv())

class Settings(BaseSettings):
    DATABASE_URL: str
    TEST_DATABASE_URL: str | None = None
    API_V1_STR: str = "/api/v1"

settings = Settings()

if "PYTEST_CURRENT_TEST" in os.environ:
    if settings.TEST_DATABASE_URL:
        settings.DATABASE_URL = settings.TEST_DATABASE_URL
    else:
        # Default to an in-memory SQLite DB for tests if TEST_DATABASE_URL is not set
        settings.DATABASE_URL = "sqlite:///:memory:"