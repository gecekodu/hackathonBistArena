from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / '.env')


def _clean(value: str | None) -> str | None:
    if value is None:
        return None
    trimmed = value.strip()
    return trimmed or None


@dataclass(frozen=True)
class Settings:
    gemini_api_key: str | None = _clean(os.getenv('GEMINI_API_KEY'))
    gemini_model: str = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash')
    firebase_project_id: str | None = _clean(os.getenv('FIREBASE_PROJECT_ID'))
    firebase_client_email: str | None = _clean(os.getenv('FIREBASE_CLIENT_EMAIL'))
    firebase_private_key: str | None = _clean(os.getenv('FIREBASE_PRIVATE_KEY'))
    firebase_database_url: str | None = _clean(os.getenv('FIREBASE_DATABASE_URL'))


settings = Settings()
