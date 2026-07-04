# app/core/config.py
"""Application settings loaded from environment / .env file using dotenv."""

import os
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
    
    # Parse CORS_ORIGINS as a list. It might be a string like '["http://localhost:3000"]' or 'http://localhost:3000'
    _cors_origins_str = os.getenv("CORS_ORIGINS", '["*"]')
    try:
        if _cors_origins_str.startswith("["):
            CORS_ORIGINS: list[str] = json.loads(_cors_origins_str)
        else:
            CORS_ORIGINS = [x.strip() for x in _cors_origins_str.split(",") if x.strip()]
    except Exception:
        CORS_ORIGINS = ["*"]

    # Company prefix used in employee login IDs (e.g. "OI" for Odoo India)
    COMPANY_LOGIN_PREFIX: str = os.getenv("COMPANY_LOGIN_PREFIX", "OI")


settings = Settings()
