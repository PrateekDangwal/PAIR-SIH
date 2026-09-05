import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.ai.models import ProviderRequest
from app.ai.registry import ProviderRegistry
from app.config import get_settings
from app.database import get_db
from app.document_processing.pdf_processor import PDFProcessor
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.audit_service import record_audit

router = APIRouter(prefix="/ai", tags=["AI"])


def _chat_system_prompt() -> str:
    return (
        "You are PAIR, an AI procurement compliance assistant for GeM. "
        "Answer clearly, professionally and conservatively. "
        "Never invent tender facts, registrations, certificates, or government verification results. "
        "Use short headings and bullet points when useful. Avoid raw markdown tables unless the user asks for a table. "
        "When analysing an uploaded document, distinguish what is explicitly stated from what is missing or requires officer verification. "
        "If project/document data is not supplied, say so."
    )


@router.get("/models")
def list_ai_models():
    return ProviderRegistry().list_model_catalog()


@router.get("/status")
def ai_status():
    return ProviderRegistry().status()


async def _generate_chat(
    message: str,
    model_id: str | None,
    db: Session,
    project_id: int | None,
) -> ChatResponse:
    try:
        provider = ProviderRegistry().get_provider("nvidia")
        request = ProviderRequest(
            system_prompt=_chat_system_prompt(),
            user_message=message,
            max_tokens=900,
            temperature=0.2,
            model_id=model_id,
        )
        response = await provider.generate_structured(request)
        record_audit(
            db,
            action="chat_message",
            project_id=project_id,
            actor="user",
            details={"model": response.model_used},
        )
        return ChatResponse(
            message=response.content.strip(),
            model_used=response.model_used,
            provider=response.provider,
        )
    except (ValueError, RuntimeError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    return await _generate_chat(
        payload.message.strip(),
        payload.model_id,
        db,
        payload.project_id,
    )


@router.post("/chat-with-pdf", response_model=ChatResponse)
async def chat_with_pdf(
    message: str = Form(default="Analyze this procurement document and summarize the important compliance points."),
    project_id: int | None = Form(default=None),
    model_id: str | None = Form(default=None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    settings = get_settings()
    filename = file.filename or "document.pdf"
    if file.content_type != "application/pdf" or Path(filename).suffix.lower() != ".pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded PDF is empty.")
    if len(content) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="PDF exceeds the configured upload size limit.")

    processor = PDFProcessor()
    temp_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(prefix="pair_chat_", suffix=".pdf", delete=False) as tmp:
            tmp.write(content)
            temp_path = Path(tmp.name)

        if not processor.validate_pdf(temp_path):
            raise HTTPException(status_code=400, detail="Uploaded file is not a valid PDF.")

        extracted = processor.extract(str(temp_path))
        text = extracted.raw_text.strip()
        if not text:
            raise HTTPException(status_code=422, detail="No readable text was found in the PDF.")

        # Keep the request bounded while retaining enough document context.
        document_text = text[:120_000]
        prompt = (
            f"USER REQUEST:\n{message.strip()[:12000]}\n\n"
            f"UPLOADED PDF: {filename}\n"
            f"PAGE COUNT: {extracted.page_count}\n\n"
            "DOCUMENT CONTENT:\n"
            f"{document_text}\n\n"
            "Answer the user's request using only the uploaded document content. "
            "Clearly mention missing/uncertain information."
        )
        return await _generate_chat(prompt, model_id, db, project_id)
    finally:
        if temp_path:
            temp_path.unlink(missing_ok=True)
