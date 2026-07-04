# app/main.py
"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.base import Base
from app.db.session import async_engine

# Import all routers
from app.api.v1.auth import router as auth_router
from app.api.v1.company_settings import router as company_router
from app.api.v1.employees import router as employees_router
from app.api.v1.attendance import router as attendance_router
from app.api.v1.leave_requests import router as leave_requests_router
from app.api.v1.leave_balances import router as leave_balances_router
from app.api.v1.salary_structures import router as salary_router
from app.api.v1.documents import router as documents_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup (dev convenience — use Alembic in production)."""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await async_engine.dispose()


app = FastAPI(
    title="HRMS Backend",
    description="Human Resource Management System API — "
                "built with FastAPI, SQLAlchemy 2.0, and PostgreSQL.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — permissive for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth_router)
app.include_router(company_router)
app.include_router(employees_router)
app.include_router(attendance_router)
app.include_router(leave_requests_router)
app.include_router(leave_balances_router)
app.include_router(salary_router)
app.include_router(documents_router)


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "HRMS Backend is running"}
