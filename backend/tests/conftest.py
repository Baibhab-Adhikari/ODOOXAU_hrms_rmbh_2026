import os
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv

load_dotenv()

# Use test database URL, fallback to empty to avoid using production DB if missing
db_url = os.environ.get("TEST_DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/test_db")
os.environ["DATABASE_URL"] = db_url

# Now import the app (after overriding env)
from app.main import app
from app.db.base import Base
from app.db.session import get_db

connect_args = {}
if "?" in db_url:
    base_url, query = db_url.split("?", 1)
    if "ssl" in query or "sslmode" in query:
        connect_args["ssl"] = "require"
    db_url = base_url

test_engine = create_async_engine(db_url, connect_args=connect_args, poolclass=NullPool)
TestingSessionLocal = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)

@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_database():
    """Create tables before the test session and drop them after."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    yield
    
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture
async def db_session():
    """Yield a database session for a test and rollback after test."""
    async with TestingSessionLocal() as session:
        yield session

@pytest_asyncio.fixture
async def client(db_session):
    """Yield an async httpx client with the dependency override for DB."""
    app.dependency_overrides[get_db] = lambda: db_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
