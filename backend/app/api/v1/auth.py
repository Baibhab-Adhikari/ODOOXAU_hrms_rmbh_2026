# app/api/v1/auth.py
"""Auth routes — signup, login, change-password, me."""

from fastapi import APIRouter, Depends

from app.core.deps import CurrentActor, DbSession
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    MeResponse,
    SignupRequest,
    TokenResponse,
)
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse, status_code=201)
async def signup(data: SignupRequest, db: DbSession) -> TokenResponse:
    """Bootstrap the company + first HR admin, or add another HR officer."""
    return await auth_service.signup(db, data)


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: DbSession) -> TokenResponse:
    """Login with email or employee login ID."""
    return await auth_service.login(db, data)


@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    actor_info: CurrentActor,
    db: DbSession,
) -> dict:
    """Change the current user's password."""
    actor, actor_type = actor_info
    return await auth_service.change_password(db, actor, actor_type, data)


@router.get("/me", response_model=MeResponse)
async def me(actor_info: CurrentActor) -> MeResponse:
    """Return the current user's basic info."""
    actor, actor_type = actor_info
    return await auth_service.get_me(actor, actor_type)
