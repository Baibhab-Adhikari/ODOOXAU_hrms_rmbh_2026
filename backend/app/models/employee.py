# app/models/employee.py
"""Employees table."""

import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    employee_code: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False
    )  # auto-generated login ID
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    job_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    department: Mapped[str | None] = mapped_column(String(255), nullable=True)
    date_of_joining: Mapped[date] = mapped_column(Date, nullable=False)
    profile_picture_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    must_reset_password: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    attendance_records: Mapped[list["Attendance"]] = relationship(  # noqa: F821
        "Attendance",
        back_populates="employee",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    leave_requests: Mapped[list["LeaveRequest"]] = relationship(  # noqa: F821
        "LeaveRequest",
        back_populates="employee",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    leave_balances: Mapped[list["LeaveBalance"]] = relationship(  # noqa: F821
        "LeaveBalance",
        back_populates="employee",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    salary_structure: Mapped["SalaryStructure | None"] = relationship(  # noqa: F821
        "SalaryStructure",
        back_populates="employee",
        lazy="selectin",
        uselist=False,
        cascade="all, delete-orphan",
    )
    documents: Mapped[list["Document"]] = relationship(  # noqa: F821
        "Document",
        back_populates="employee",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
