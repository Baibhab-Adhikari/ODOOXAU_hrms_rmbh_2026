# app/db/session.py
"""Async SQLAlchemy engine and session factory."""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

# Strip query parameters that confuse asyncpg (like sslmode, channel_binding)
db_url = settings.DATABASE_URL
connect_args = {}

if "?" in db_url:
    base_url, query = db_url.split("?", 1)
    if "ssl" in query or "sslmode" in query:
        # Pass SSL config directly to asyncpg
        connect_args["ssl"] = "require"
    db_url = base_url

async_engine = create_async_engine(
    db_url,
    echo=False,
    pool_pre_ping=True,
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:  # type: ignore[misc]
    """FastAPI dependency that yields an async DB session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
