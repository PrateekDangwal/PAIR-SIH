import json
import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.requirement import Requirement
from app.models.document import Document
from app.ai.registry import ProviderRegistry
from app.ai.models import ProviderRequest
from app.schemas.requirement import AIExtractionResponse, ExtractedRequirement
from pydantic import ValidationError

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a GeM (Government e-Marketplace) bid compliance analyst.
Your task: extract ONLY real procurement/compliance requirements from a government tender bid document.

Rules:
- Extract ONLY actual requirements stated in the document
- Do NOT invent, paraphrase, or add requirements not present in the text
- If a page number is uncertain, set source_page_number to null
- Allowed categories: eligibility, technical, financial, mandatory_document, certification, experience, delivery, terms, other
- is_mandatory = true only for requirements explicitly stated as mandatory/essential/must
- priority: 5 = critical, 4 = high, 3 = medium, 2 = low, 1 = nice-to-have
- severity: critical | high | medium | low
- confidence: your confidence (0.0-1.0) that this is a genuine requirement

Return ONLY valid JSON. No markdown. No explanation. No preamble.

JSON structure:
{
  "requirements": [
    {
      "title": "short descriptive title",
      "description": "brief explanation of what this requirement means",
      "requirement_text": "verbatim or near-verbatim text from the document",
      "category": "eligibility",
      "is_mandatory": true,
      "priority": 5,
      "severity": "high",
      "source_page_number": 12,
      "confidence": 0.95
    }
  ]
}"""


def _build_user_message(raw_text: str, filename: str) -> str:
    # Truncate to avoid exceeding context window (Claude supports ~200k tokens)
    # 150,000 chars ≈ ~37,500 tokens — safe for most bids
    MAX_CHARS = 150_000
    truncated = raw_text[:MAX_CHARS]
    if len(raw_text) > MAX_CHARS:
        truncated += "\n\n[Document truncated for processing]"

    return (
        f"Extract all procurement and compliance requirements from this GeM bid document.\n\n"
        f"Document: {filename}\n\n"
        f"---BEGIN DOCUMENT---\n{truncated}\n---END DOCUMENT---"
    )


def _parse_ai_response(content: str) -> AIExtractionResponse:
    """Parse and validate AI JSON output with Pydantic."""
    # Strip markdown fences if present
    text = content.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    text = text.strip()

    try:
        raw = json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"AI returned invalid JSON: {exc}") from exc

    try:
        return AIExtractionResponse(**raw)
    except ValidationError as exc:
        raise ValueError(f"AI response failed Pydantic validation: {exc}") from exc


class RequirementService:
    """Orchestrates AI requirement extraction and persistence."""

    def __init__(self, db: Session):
        self.db = db
        self._registry = ProviderRegistry()

    async def extract_and_store(
        self,
        document: Document,
        provider_name: str | None = None,
    ) -> tuple[list[Requirement], str]:
        """Extract requirements from a document and persist them.

        Returns (list of Requirement ORM objects, model_name_used).
        """
        if document.extraction_status != "completed":
            raise HTTPException(
                status_code=400,
                detail="Text extraction must complete before AI processing. "
                       "Call /extract first.",
            )
        if not document.raw_text:
            raise HTTPException(
                status_code=400,
                detail="Document has no extracted text.",
            )

        provider = self._registry.get_provider(provider_name)
        model_info = provider.get_model_info()

        user_msg = _build_user_message(document.raw_text, document.filename)
        request = ProviderRequest(
            system_prompt=SYSTEM_PROMPT,
            user_message=user_msg,
            max_tokens=4096,
            temperature=0.1,
        )

        # Try once, retry once on parse failure
        ai_response = None
        last_error: Exception | None = None

        for attempt in range(2):
            try:
                ai_response = await provider.generate_structured(request)
                parsed = _parse_ai_response(ai_response.content)
                break
            except ValueError as exc:
                last_error = exc
                logger.warning(
                    "AI response parse failed (attempt %d/2): %s", attempt + 1, exc
                )
                if attempt == 0:
                    continue
            except RuntimeError as exc:
                # Provider-level errors (auth, connection, rate limit)
                status = 503 if "unavailable" in str(exc) else 500
                raise HTTPException(status_code=status, detail=str(exc)) from exc

        if last_error and ai_response is None:
            raise HTTPException(
                status_code=422,
                detail=f"AI returned malformed output after 2 attempts: {last_error}",
            )

        if last_error:
            # Second attempt also failed
            raise HTTPException(
                status_code=422,
                detail=f"AI returned malformed output after 2 attempts: {last_error}",
            )

        # Persist requirements
        saved: list[Requirement] = []
        for req_data in parsed.requirements:
            req = Requirement(
                project_id=document.project_id,
                source_document_id=document.id,
                title=req_data.title,
                description=req_data.description,
                requirement_text=req_data.requirement_text,
                category=req_data.category,
                is_mandatory=req_data.is_mandatory,
                priority=req_data.priority,
                severity=req_data.severity,
                source_page_number=req_data.source_page_number,
                extraction_confidence=req_data.confidence,
                extracted_by_model=model_info.model_id,
            )
            self.db.add(req)
            saved.append(req)

        self.db.commit()
        for r in saved:
            self.db.refresh(r)

        logger.info(
            "Extracted %d requirements from doc=%d using %s",
            len(saved),
            document.id,
            model_info.model_id,
        )
        return saved, model_info.model_id
