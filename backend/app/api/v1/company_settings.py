# app/api/v1/company_settings.py
"""Company settings routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select

from app.core.deps import DbSession, require_hr_or_admin
from app.models.company_settings import CompanySettings
from app.models.hr_officer import HROfficer
from app.schemas.company import CompanySettingsOut, CompanySettingsUpdate

router = APIRouter(prefix="/company-settings", tags=["Company Settings"])


@router.get("", response_model=CompanySettingsOut)
async def get_company_settings(db: DbSession) -> CompanySettingsOut:
    """Public: get company name + logo for sign-in page branding."""
    result = await db.execute(select(CompanySettings).limit(1))
    company = result.scalar_one_or_none()
    if company is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company settings not found. Please sign up first.",
        )
    return CompanySettingsOut.model_validate(company)


@router.patch("", response_model=CompanySettingsOut)
async def update_company_settings(
    data: CompanySettingsUpdate,
    db: DbSession,
    admin: HROfficer = Depends(require_hr_or_admin),
) -> CompanySettingsOut:
    """Admin only: update company name/logo."""
    result = await db.execute(select(CompanySettings).limit(1))
    company = result.scalar_one_or_none()
    if company is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company settings not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)

    await db.flush()
    await db.refresh(company)
    return CompanySettingsOut.model_validate(company)
