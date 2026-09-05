import json
import logging
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException
from app.models.evidence import Evidence
from app.models.document import Document
from app.ai.registry import ProviderRegistry
from app.ai.models import ProviderRequest
from app.schemas.evidence import AIEvidenceResponse
from pydantic import ValidationError

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are extracting factual evidence from a vendor document for
procurement compliance verification on the Government e-Marketplace (GeM).

Rules:
1. Extract ONLY facts explicitly present in the document.
2. Never invent evidence.
3. Never infer missing information.
4. Never invent certificates, dates, or qualifications.
5. Never assume compliance.
6. Preserve the meaning of source text exactly.
7. Include source page number whenever it can be reliably identified.
8. Return structured JSON ONLY. No markdown. No explanation. No preamble.
9. If no relevant evidence exists, return an empty list.
10. If the document explicitly states that a required document,
authorization, certificate, registration, or declaration is NOT provided,
extract that statement as evidence instead of ignoring it.

Allowed evidence_type values:
eligibility, technical, financial, certification, experience,
delivery, mandatory_document, terms, debarment, warranty, other

JSON structure:
{
  "evidence": [
    {
      "evidence_text": "verbatim or near-verbatim text from the document",
      "evidence_type": "experience",
      "source_page_number": 7,
      "confidence": 0.94
    }
  ]
}

If no evidence is found, return exactly:
{"evidence": []}"""


def _build_user_message(raw_text: str, filename: str) -> str:
    MAX_CHARS = 150_000
    truncated = raw_text[:MAX_CHARS]
    if len(raw_text) > MAX_CHARS:
        truncated += "\n\n[Document truncated for processing]"
    return (
        f"Extract all factual evidence from this vendor document "
        f"relevant to GeM procurement compliance.\n\n"
        f"Document: {filename}\n\n"
        f"---BEGIN DOCUMENT---\n{truncated}\n---END DOCUMENT---"
    )


def _parse_ai_response(content: str) -> AIEvidenceResponse:
    """Parse and validate AI JSON with Pydantic. Raises ValueError on failure."""
    text = content.strip()
    # Strip markdown fences if present
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    text = text.strip()

    try:
        raw = json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"AI returned invalid JSON: {exc}") from exc

    try:
        return AIEvidenceResponse(**raw)
    except ValidationError as exc:
        raise ValueError(f"AI response failed Pydantic validation: {exc}") from exc


class EvidenceService:
    """Orchestrates AI evidence extraction from vendor documents."""

    def __init__(self, db: Session):
        self.db = db
        self._registry = ProviderRegistry()

    def get_document_evidence(self, document_id: int) -> list[Evidence]:
        stmt = (
            select(Evidence)
            .where(Evidence.source_document_id == document_id)
            .order_by(Evidence.source_page_number.asc().nulls_last(), Evidence.created_at)
        )
        return list(self.db.scalars(stmt))

    def get_project_evidence(self, project_id: int) -> list[Evidence]:
        stmt = (
            select(Evidence)
            .where(Evidence.project_id == project_id)
            .order_by(Evidence.source_page_number.asc().nulls_last(), Evidence.created_at)
        )
        return list(self.db.scalars(stmt))

    async def extract_and_store(
        self,
        document: Document,
        provider_name: str | None = None,
    ) -> tuple[list[Evidence], str]:
        """Extract evidence from a vendor document and persist it.

        Returns (list of Evidence ORM objects, model_name_used).
        """
        if document.document_type != "vendor":
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Evidence extraction is only for vendor documents. "
                    f"This document has type '{document.document_type}'. "
                    f"Upload with document_type=vendor."
                ),
            )
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

        # Try up to 2 attempts on parse failure
        ai_response = None
        last_error: Exception | None = None
        parsed = None

        for attempt in range(2):
            try:
                ai_response = await provider.generate_structured(request)
                parsed = _parse_ai_response(ai_response.content)
                last_error = None
                break
            except ValueError as exc:
                last_error = exc
                logger.warning(
                    "Evidence AI parse failed (attempt %d/2): %s", attempt + 1, exc
                )
            except RuntimeError as exc:
                status = 503 if "unavailable" in str(exc) else 500
                raise HTTPException(status_code=status, detail=str(exc)) from exc

        if last_error is not None:
            raise HTTPException(
                status_code=422,
                detail=f"AI returned malformed output after 2 attempts: {last_error}",
            )

        # Persist evidence items, removing exact duplicates from the same AI response.
        saved: list[Evidence] = []
        seen: set[tuple[str, int | None]] = set()

        for ev_data in parsed.evidence:
            normalized_text = " ".join(
                ev_data.evidence_text.strip().lower().split()
            )
            dedupe_key = (
                normalized_text,
                ev_data.source_page_number,
            )

            if dedupe_key in seen:
                continue

            seen.add(dedupe_key)

            ev = Evidence(
                project_id=document.project_id,
                source_document_id=document.id,
                evidence_text=ev_data.evidence_text.strip(),
                evidence_type=ev_data.evidence_type,
                source_page_number=ev_data.source_page_number,
                confidence=ev_data.confidence,
                extracted_by_model=model_info.model_id,
            )
            self.db.add(ev)
            saved.append(ev)

        self.db.commit()
        for e in saved:
            self.db.refresh(e)

        logger.info(
            "Extracted %d evidence items from doc=%d using %s",
            len(saved),
            document.id,
            model_info.model_id,
        )
        return saved, model_info.model_id
