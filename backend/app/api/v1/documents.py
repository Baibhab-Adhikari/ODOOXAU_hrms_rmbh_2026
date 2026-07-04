# app/api/v1/documents.py
"""Document routes."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy import select
import os
import shutil

UPLOAD_DIR = "/app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

from app.core.constants import ActorType
from app.core.deps import CurrentActor, DbSession, require_employee, require_hr_or_admin
from app.models.document import Document
from app.models.employee import Employee
from app.models.hr_officer import HROfficer
from app.schemas.document import DocumentCreate, DocumentOut

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload", status_code=201)
async def upload_document(
    actor_info: CurrentActor,
    file: UploadFile = File(...),
) -> dict:
    """Upload a file to the server and return its static URL."""
    file_ext = os.path.splitext(file.filename or "")[1]
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"file_url": f"http://localhost:8000/static/uploads/{unique_filename}"}


@router.post("", response_model=DocumentOut, status_code=201)
async def create_document(
    data: DocumentCreate,
    actor_info: CurrentActor,
    db: DbSession,
) -> DocumentOut:
    """Employee (self) or HR/Admin (on behalf of an employee)."""
    actor, actor_type = actor_info

    # Employees can only upload for themselves
    if actor_type == ActorType.EMPLOYEE and actor.id != data.employee_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employees can only upload documents for themselves",
        )

    document = Document(
        employee_id=data.employee_id,
        doc_type=data.doc_type,
        file_url=data.file_url,
    )
    db.add(document)
    await db.flush()
    await db.refresh(document)
    return DocumentOut.model_validate(document)


@router.get("/me", response_model=list[DocumentOut])
async def get_my_documents(
    db: DbSession,
    employee: Employee = Depends(require_employee),
) -> list[DocumentOut]:
    """Employee: own documents."""
    result = await db.execute(
        select(Document)
        .where(Document.employee_id == employee.id)
        .order_by(Document.uploaded_at.desc())
    )
    return [DocumentOut.model_validate(d) for d in result.scalars().all()]


@router.get("/{employee_id}", response_model=list[DocumentOut])
async def get_employee_documents(
    employee_id: uuid.UUID,
    db: DbSession,
    hr: HROfficer = Depends(require_hr_or_admin),
) -> list[DocumentOut]:
    """HR/Admin: view any employee's documents."""
    result = await db.execute(
        select(Document)
        .where(Document.employee_id == employee_id)
        .order_by(Document.uploaded_at.desc())
    )
    return [DocumentOut.model_validate(d) for d in result.scalars().all()]


@router.delete("/{document_id}", status_code=204)
async def delete_document(
    document_id: uuid.UUID,
    actor_info: CurrentActor,
    db: DbSession,
) -> None:
    """Owner or admin: delete a document."""
    actor, actor_type = actor_info

    result = await db.execute(
        select(Document).where(Document.id == document_id)
    )
    document = result.scalar_one_or_none()
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    # Employees can only delete their own; HR officers can delete any
    if actor_type == ActorType.EMPLOYEE and document.employee_id != actor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own documents",
        )

    await db.delete(document)
    await db.flush()
