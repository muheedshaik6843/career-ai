import os
import uuid
import logging
from typing import Optional, List
from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session

from app.repositories.resume_repository import resume_repository
from app.models.resume import Resume, ResumeStatus
from app.services.resume_parser import (
    extract_text_from_pdf, extract_text_from_docx, parse_resume
)
from app.services.ats_engine import compute_ats_score

logger = logging.getLogger(__name__)

ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/msword": "doc",
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
UPLOAD_DIR = "uploads/resumes"


class ResumeService:
    def __init__(self):
        os.makedirs(UPLOAD_DIR, exist_ok=True)

    async def upload_and_parse(self, db: Session, user_id: str, file: UploadFile) -> Resume:
        """Upload a resume file, parse it, and compute ATS score."""
        # Validate content type
        content_type = file.content_type or ""
        file_ext = ALLOWED_TYPES.get(content_type)

        if not file_ext:
            # Try extension fallback
            original_name = file.filename or ""
            if original_name.endswith(".pdf"):
                file_ext = "pdf"
            elif original_name.endswith(".docx"):
                file_ext = "docx"
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Only PDF and DOCX files are supported."
                )

        # Read file bytes
        file_bytes = await file.read()
        file_size = len(file_bytes)

        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds 10MB limit. File is {file_size // (1024*1024)}MB."
            )

        if file_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty."
            )

        # Save file locally
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        with open(file_path, "wb") as f:
            f.write(file_bytes)

        # Create initial DB record
        resume_count = resume_repository.count_user_resumes(db, user_id)
        resume_data = {
            "user_id": user_id,
            "filename": unique_filename,
            "original_filename": file.filename or unique_filename,
            "file_url": f"/uploads/resumes/{unique_filename}",
            "file_size": file_size,
            "file_type": file_ext,
            "status": ResumeStatus.PROCESSING,
            "version": resume_count + 1,
            "is_primary": resume_count == 0,  # First upload is primary
        }
        resume = resume_repository.create(db, obj_in=resume_data)

        try:
            # Parse text from file
            if file_ext == "pdf":
                raw_text = extract_text_from_pdf(file_bytes)
            else:
                raw_text = extract_text_from_docx(file_bytes)

            if not raw_text or len(raw_text.strip()) < 50:
                raise ValueError("Insufficient text extracted from resume. The file may be image-based or corrupted.")

            # Parse structured data
            parsed = parse_resume(raw_text)

            # Compute ATS score
            ats_result = compute_ats_score(raw_text, parsed)

            # Update resume record
            update_data = {
                "raw_text": raw_text[:10000],  # Store first 10k chars
                "status": ResumeStatus.COMPLETED,
                **{k: v for k, v in parsed.items()},
                "ats_score": ats_result["score"],
                "ats_feedback": ats_result["feedback"],
                "improvement_suggestions": ats_result["suggestions"],
            }
            resume = resume_repository.update(db, db_obj=resume, obj_in=update_data)
            logger.info(f"Resume {resume.id} parsed successfully. ATS Score: {ats_result['score']}")

        except Exception as e:
            logger.error(f"Resume parsing failed for {resume.id}: {e}")
            resume_repository.update(db, db_obj=resume, obj_in={
                "status": ResumeStatus.FAILED,
                "parse_error": str(e)
            })
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Resume parsing failed: {str(e)}"
            )

        return resume

    def get_user_resumes(self, db: Session, user_id: str, skip: int = 0, limit: int = 20) -> List[Resume]:
        return resume_repository.get_user_resumes(db, user_id=user_id, skip=skip, limit=limit)

    def get_resume(self, db: Session, resume_id: str, user_id: str) -> Resume:
        resume = resume_repository.get_user_resume(db, resume_id=resume_id, user_id=user_id)
        if not resume:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")
        return resume

    def set_primary(self, db: Session, resume_id: str, user_id: str) -> Resume:
        resume = self.get_resume(db, resume_id=resume_id, user_id=user_id)
        resume_repository.unset_all_primary(db, user_id=user_id)
        resume_repository.update(db, db_obj=resume, obj_in={"is_primary": True})
        return resume

    def delete_resume(self, db: Session, resume_id: str, user_id: str) -> bool:
        resume = self.get_resume(db, resume_id=resume_id, user_id=user_id)
        resume_repository.soft_delete(db, id=resume_id)
        return True


resume_service = ResumeService()
