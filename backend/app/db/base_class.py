# app/db/base_class.py
"""Declarative base class — no model imports here to avoid circular deps."""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass
