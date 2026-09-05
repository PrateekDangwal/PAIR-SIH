import shutil
import uuid
from pathlib import Path
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
from app.models.document import Document
from app.config import get_settings
from app.document_processing.pdf_processor import PDFProcessor
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

ALLOWED_MIME_TYPES = {"application/pdf"}
ALLOWED_EXTENSIONS = {".pdf"}


class DocumentService:
    def __init__(self, db: Session):
        self.db = db
        self._pdf_processor = PDFProcessor()

    def _safe_filename(self, original: str) -> str:
        """Produce a UUID-based filename to prevent path traversal."""
        suffix = Path(original).suffix.lower()
        if suffix not in ALLOWED_EXTENSIONS:
            suffix = ".pdf"
        return f"{uuid.uuid4().hex}{suffix}"

    def _validate_upload(self, file: UploadFile, size_bytes: int) -> None:
        # MIME type check
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Only PDF files are accepted. Got: {file.content_type}",
            )
        # Extension check
        suffix = Path(file.filename or "").suffix.lower()
        if suffix not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail="File must have a .pdf extension.",
            )
        # Size check
        if size_bytes > settings.max_upload_bytes:
            raise HTTPException(
                status_code=413,
                detail=(
                    f"File too large. Max allowed: {settings.MAX_UPLOAD_SIZE_MB} MB. "
                    f"Got: {round(size_bytes / 1024 / 1024, 2)} MB"
                ),
            )

    async def upload(
        self, project_id: int, file: UploadFile, document_type: str = "bid"
    ) -> Document:
        # Read file content once so we can check size
        content = await file.read()
        size_bytes = len(content)

        self._validate_upload(file, size_bytes)

        # Save to uploads/
        safe_name = self._safe_filename(file.filename or "upload.pdf")
        dest_path = settings.upload_path / safe_name

        with open(dest_path, "wb") as f:
            f.write(content)

        # Quick PDF validity check
        if not self._pdf_processor.validate_pdf(dest_path):
            dest_path.unlink(missing_ok=True)
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is not a valid PDF.",
            )

        document = Document(
            project_id=project_id,
            filename=file.filename or safe_name,
            file_path=str(dest_path),
            file_size=size_bytes,
            mime_type=file.content_type or "application/pdf",
            document_type=document_type,
            extraction_status="pending",
        )
        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)
        logger.info(
            "Uploaded document id=%d project=%d file=%s size=%d",
            document.id,
            project_id,
            safe_name,
            size_bytes,
        )
        return document

    def get(self, document_id: int, project_id: int) -> Document:
        document = self.db.get(Document, document_id)
        if not document:
            raise HTTPException(status_code=404, detail=f"Document {document_id} not found")
        if document.project_id != project_id:
            raise HTTPException(
                status_code=404,
                detail="Document does not belong to this project",
            )
        return document

    def extract_text(self, document: Document) -> Document:
        """Extract PDF text and update the document record."""
        document.extraction_status = "processing"
        self.db.commit()

        try:
            result = self._pdf_processor.extract(document.file_path)
            document.raw_text = result.raw_text
            document.page_count = result.page_count
            document.extraction_status = "completed"
            logger.info(
                "Extraction complete doc=%d pages=%d", document.id, result.page_count
            )
        except Exception as exc:
            document.extraction_status = "failed"
            logger.error("Text extraction failed for doc=%d: %s", document.id, exc)
            self.db.commit()
            raise HTTPException(
                status_code=500,
                detail=f"PDF text extraction failed: {exc}",
            )

        self.db.commit()
        self.db.refresh(document)
        return document
