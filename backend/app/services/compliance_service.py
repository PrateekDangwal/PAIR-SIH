import json
import logging
import re
from collections import defaultdict

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.models import ProviderRequest
from app.ai.registry import ProviderRegistry
from app.models.compliance import ComplianceResult
from app.models.evidence import Evidence
from app.models.requirement import Requirement
from app.schemas.compliance import ComplianceResultCreate
from app.services.audit_service import record_audit

logger = logging.getLogger(__name__)

VALID_STATUSES = {
    "compliant",
    "partial",
    "non_compliant",
    "needs_review",
    "insufficient_data",
}


# ---------------------------------------------------------------------------
# Compliance result CRUD
# ---------------------------------------------------------------------------

def create_compliance_result(
    db: Session,
    payload: ComplianceResultCreate,
) -> ComplianceResult:
    if payload.status not in VALID_STATUSES:
        raise ValueError(f"Invalid status: {payload.status}")

    requirement = db.scalar(
        select(Requirement).where(
            Requirement.id == payload.requirement_id,
            Requirement.project_id == payload.project_id,
        )
    )

    if requirement is None:
        raise LookupError("Requirement not found for the supplied project")

    if payload.evidence_id is not None:
        evidence = db.scalar(
            select(Evidence).where(
                Evidence.id == payload.evidence_id,
                Evidence.project_id == payload.project_id,
            )
        )

        if evidence is None:
            raise LookupError("Evidence not found for the supplied project")

    result = ComplianceResult(**payload.model_dump())

    db.add(result)
    db.commit()
    db.refresh(result)

    return result


def get_compliance_results(
    db: Session,
    project_id: int,
) -> list[ComplianceResult]:
    return list(
        db.scalars(
            select(ComplianceResult)
            .where(ComplianceResult.project_id == project_id)
            .order_by(ComplianceResult.id)
        ).all()
    )


# ---------------------------------------------------------------------------
# AI compliance analysis
# ---------------------------------------------------------------------------

def _parse_ai_json(content: str) -> dict:
    text = content.strip()

    if text.startswith("```"):
        lines = text.splitlines()

        if lines and lines[-1].strip().startswith("```"):
            text = "\n".join(lines[1:-1])
        else:
            text = "\n".join(lines[1:])

    return json.loads(text.strip())


async def analyze_compliance_with_ai(
    requirement_text: str,
    evidence_text: str,
    model_id: str | None = None,
):
    provider = ProviderRegistry().get_provider("nvidia")

    system_prompt = """
You are an expert GeM procurement compliance verification AI.

Your job is to compare ONE tender requirement against ONE piece of
bidder evidence.

Return ONLY valid JSON:

{
  "status": "compliant",
  "confidence": 0.95,
  "explanation": "Evidence-based explanation."
}

Allowed status values:

- compliant:
  The supplied evidence clearly satisfies the requirement.

- partial:
  The supplied evidence satisfies only part of the requirement, or an
  important condition is unresolved.

- non_compliant:
  The supplied evidence explicitly shows that the requirement is not met.

- needs_review:
  The evidence is ambiguous, contradictory, or requires human verification.

- insufficient_data:
  The evidence does not contain enough information to determine compliance.

IMPORTANT RULES:

1. Use ONLY the supplied bidder evidence.
2. Never invent facts.
3. Never assume a certificate, registration, authorization, declaration,
   qualification, date, or verification exists.
4. Do NOT treat a generic statement as proof of a specific certificate.
5. Do NOT treat product specifications as proof of GST, PAN, Udyam, BIS,
   OEM authorization, financial documents, warranty, or debarment status.
6. If the required evidence is missing, return "insufficient_data".
7. If the evidence explicitly says that a required document/authorization
   was not provided, return "non_compliant".
8. A claim such as "compliant with BIS" is not automatically proof of a
   valid BIS certificate unless certificate/document evidence is actually
   supplied.
9. A PAN/GST/Udyam number alone is not necessarily proof of a valid official
   registration document.
10. Explain exactly which part of the supplied evidence supports or fails
    the requirement.
"""

    request = ProviderRequest(
        system_prompt=system_prompt,
        user_message=(
            f"TENDER REQUIREMENT:\n"
            f"{requirement_text}\n\n"
            f"BIDDER EVIDENCE:\n"
            f"{evidence_text}\n\n"
            "Determine the compliance status using ONLY this evidence."
        ),
        max_tokens=500,
        temperature=0.0,
        model_id=model_id,
    )

    response = await provider.generate_structured(request)

    try:
        result = _parse_ai_json(response.content)
    except json.JSONDecodeError:
        return {
            "status": "needs_review",
            "confidence": 0.0,
            "explanation": "AI returned an invalid structured response.",
            "model_used": response.model_used,
            "provider": response.provider,
        }

    status = result.get("status", "needs_review")

    if status not in VALID_STATUSES:
        status = "needs_review"

    try:
        confidence = float(result.get("confidence", 0.0))
    except (TypeError, ValueError):
        confidence = 0.0

    confidence = max(0.0, min(1.0, confidence))

    return {
        "status": status,
        "confidence": confidence,
        "explanation": str(result.get("explanation", "")),
        "model_used": response.model_used,
        "provider": response.provider,
    }


# ---------------------------------------------------------------------------
# Requirement / evidence domain matching
# ---------------------------------------------------------------------------

DOMAIN_TERMS = {
    "gst": {"gst", "gstin", "gst registration", "goods and services tax"},
    "pan": {"pan", "permanent account number"},
    "udyam": {"udyam", "udyam registration", "msme registration"},
    "bis": {"bis", "bureau of indian standards", "bis certification", "bis certificate"},
    "oem": {"oem", "oem authorization", "oem authorisation", "manufacturer authorization",
            "manufacturer authorisation", "authorized manufacturer", "authorised manufacturer"},
    "financial": {"financial statement", "audited financial", "audited statement",
                  "turnover", "balance sheet", "profit and loss", "auditor"},
    "make_india": {"make in india", "local content", "local-content", "local content declaration",
                   "local-content declaration", "indigenous content"},
    "technical": {"technical specification", "technical specifications", "technical datasheet",
                  "datasheet", "model", "supported parameters", "manufacturer literature"},
    "debarment": {"blacklisted", "blacklisting", "debarred", "debarment", "blacklist"},
    "warranty": {"warranty", "warranty period", "technical support", "maintenance commitment",
                 "guarantee period"},
}


DOMAIN_PRIORITY = [
    "warranty",
    "debarment",
    "oem",
    "udyam",
    "gst",
    "pan",
    "make_india",
    "financial",
    "bis",
    "technical",
]


STOP_WORDS = {
    "the",
    "a",
    "an",
    "and",
    "or",
    "for",
    "of",
    "to",
    "must",
    "provide",
    "submit",
    "required",
    "where",
    "applicable",
    "bidder",
    "shall",
    "should",
    "valid",
    "document",
    "evidence",
    "with",
    "this",
    "that",
    "from",
    "under",
    "including",
    "requirement",
}


def _words(text: str) -> set[str]:
    return {
        word
        for word in re.findall(r"[a-z0-9]+", (text or "").lower())
        if len(word) > 2 and word not in STOP_WORDS
    }


def _normalise_text(text: str) -> str:
    return re.sub(
        r"\s+",
        " ",
        (text or "").lower(),
    ).strip()


def _detect_requirement_domain(requirement: Requirement) -> str | None:
    """
    Detect the primary compliance domain from the requirement title/text.

    Title gets priority because categories such as 'technical' are too broad.
    """

    title = _normalise_text(requirement.title)

    full_text = _normalise_text(
        " ".join(
            [
                requirement.title or "",
                requirement.requirement_text or "",
            ]
        )
    )

    # Exact/high-confidence phrases first.
    if "warranty" in title or "support commitment" in title:
        return "warranty"

    if (
        "debarment" in title
        or "blacklisting" in title
        or "blacklisted" in title
        or "debarred" in title
    ):
        return "debarment"

    if "oem" in title or "manufacturer authorization" in title:
        return "oem"

    if "udyam" in title or "msme" in title:
        return "udyam"

    if "gst" in title or "gstin" in title:
        return "gst"

    if "pan" in title:
        return "pan"

    if (
        "make in india" in title
        or "local-content" in title
        or "local content" in title
    ):
        return "make_india"

    if (
        "financial statement" in title
        or "financial" in title
        or "audited" in title
    ):
        return "financial"

    if "bis" in title:
        return "bis"

    # Fallback to full requirement text.
    # Use explicit domain words only, not broad generic words.
    for domain in DOMAIN_PRIORITY:
        terms = DOMAIN_TERMS[domain]

        if any(
            re.search(rf"\b{re.escape(term)}\b", full_text)
            for term in terms
            if len(term) > 3
        ):
            return domain

    category = _normalise_text(requirement.category)

    if category == "financial":
        return "financial"

    if category == "certification":
        return "bis"

    if category == "mandatory_document":
        return "debarment"

    if category == "technical":
        return "technical"

    return None


def _contains_phrase(text: str, phrase: str) -> bool:
    return phrase in text


def _detect_evidence_domains(evidence: Evidence) -> set[str]:
    """
    Strict evidence-domain classification. Generic words such as
    'manufacturer', 'certificate', 'support', 'tax', or 'standard' do not
    create a domain by themselves.
    """
    text = _normalise_text(evidence.evidence_text or "")
    evidence_type = _normalise_text(evidence.evidence_type or "")
    combined = f"{text} {evidence_type}".strip()
    domains: set[str] = set()

    if re.search(r"\b(gst|gstin)\b", combined) or "goods and services tax" in combined:
        domains.add("gst")
    if re.search(r"\bpan\b", combined) or "permanent account number" in combined:
        domains.add("pan")
    if "udyam" in combined or "msme registration" in combined:
        domains.add("udyam")
    if re.search(r"\bbis\b", combined) or "bureau of indian standards" in combined:
        domains.add("bis")

    # OEM requires an authorization relationship, not merely the word
    # manufacturer, because technical manufacturer literature is common.
    if (
        "oem" in combined
        or (
            "manufacturer" in combined
            and re.search(r"\b(authori[sz]ed|authori[sz]ation)\b", combined)
        )
        or "oem authorization" in combined
        or "oem authorisation" in combined
    ):
        domains.add("oem")

    if (
        "financial statement" in combined
        or "audited financial" in combined
        or "balance sheet" in combined
        or "profit and loss" in combined
        or re.search(r"\b(turnover|auditor)\b", combined)
    ):
        domains.add("financial")

    if (
        "make in india" in combined
        or "local content" in combined
        or "local-content" in combined
        or "indigenous content" in combined
    ):
        domains.add("make_india")

    if (
        "technical specification" in combined
        or "technical datasheet" in combined
        or "datasheet" in combined
        or "supported parameters" in combined
        or "manufacturer literature" in combined
        or evidence_type == "technical"
    ):
        domains.add("technical")

    if re.search(r"\b(blacklisted|blacklisting|debarred|debarment|blacklist)\b", combined):
        domains.add("debarment")

    if (
        "warranty" in combined
        or "warranty period" in combined
        or "technical support" in combined
        or "maintenance commitment" in combined
        or "guarantee period" in combined
        or evidence_type == "warranty"
    ):
        domains.add("warranty")

    return domains


def _evidence_score(
    requirement: Requirement,
    evidence: Evidence,
) -> float:
    """
    Score evidence only inside the requirement's domain.

    This prevents:
        GST -> BIS
        Udyam -> BIS
        OEM -> technical
        Warranty -> technical
    """

    domain = _detect_requirement_domain(requirement)

    if domain is None:
        return 0.0

    evidence_domains = _detect_evidence_domains(evidence)

    # Hard domain boundary.
    if domain not in evidence_domains:
        return 0.0

    req_text = _normalise_text(
        " ".join(
            [
                requirement.title or "",
                requirement.requirement_text or "",
            ]
        )
    )

    evidence_text = _normalise_text(evidence.evidence_text)

    req_words = _words(req_text)
    evidence_words = _words(evidence_text)

    score = 1.0

    # Exact domain match is the strongest signal.
    score += 1.0

    # Evidence type gets only a small bonus.
    if (
        (evidence.evidence_type or "").lower()
        == (requirement.category or "").lower()
    ):
        score += 0.10

    overlap = req_words.intersection(evidence_words)

    if req_words:
        score += 0.50 * (
            len(overlap) / len(req_words)
        )

    # Strong phrase matching.
    title = _normalise_text(requirement.title)

    exact_phrases = {
        "gst": ["gst", "gstin", "gst registration"],
        "pan": ["pan", "permanent account number"],
        "udyam": ["udyam", "msme", "udyam registration"],
        "bis": ["bis", "bis standard", "bis certification"],
        "oem": ["oem", "manufacturer authorization", "manufacturer authorisation"],
        "financial": ["audited financial statement", "financial statement"],
        "make_india": ["make in india", "local content", "local-content"],
        "technical": ["technical specification", "technical datasheet"],
        "debarment": ["blacklisted", "debarred", "debarment"],
        "warranty": ["warranty", "technical support", "support"],
    }

    for phrase in exact_phrases.get(domain, []):
        if phrase in title and phrase in evidence_text:
            score += 2.0

    # Evidence explicitly indicating absence is valuable.
    missing_phrases = [
        "not provided",
        "not submitted",
        "not available",
        "missing",
        "not included",
        "no authorization",
        "no authorisation",
    ]

    if any(phrase in evidence_text for phrase in missing_phrases):
        score += 0.50

    return score


def _select_evidence(
    requirement: Requirement,
    evidence_items: list[Evidence],
) -> Evidence | None:
    if not evidence_items:
        return None

    domain = _detect_requirement_domain(requirement)

    if domain is None:
        logger.warning(
            "Could not determine requirement domain: requirement_id=%s title=%s",
            requirement.id,
            requirement.title,
        )
        return None

    scored = []

    for evidence in evidence_items:
        score = _evidence_score(requirement, evidence)

        if score > 0:
            scored.append((score, evidence))

    if not scored:
        return None

    scored.sort(
        key=lambda item: (
            item[0],
            item[1].confidence or 0.0,
            item[1].id,
        ),
        reverse=True,
    )

    best_score, best_evidence = scored[0]

    logger.info(
        "Evidence match: requirement=%s domain=%s evidence=%s score=%.2f text=%s",
        requirement.id,
        domain,
        best_evidence.id,
        best_score,
        best_evidence.evidence_text[:120],
    )

    return best_evidence


# ---------------------------------------------------------------------------
# Analyze all requirements
# ---------------------------------------------------------------------------

async def analyze_all_requirements(
    db: Session,
    project_id: int,
    model_id: str | None = None,
) -> dict:
    requirements = list(
        db.scalars(
            select(Requirement)
            .where(Requirement.project_id == project_id)
            .order_by(
                Requirement.priority.desc(),
                Requirement.id,
            )
        ).all()
    )

    evidence_items = list(
        db.scalars(
            select(Evidence)
            .where(Evidence.project_id == project_id)
            .order_by(Evidence.id)
        ).all()
    )

    analyzed = 0

    for requirement in requirements:
        domain = _detect_requirement_domain(requirement)

        evidence = _select_evidence(
            requirement,
            evidence_items,
        )

        # No relevant evidence at all.
        if evidence is None:
            result = create_compliance_result(
                db,
                ComplianceResultCreate(
                    project_id=project_id,
                    requirement_id=requirement.id,
                    evidence_id=None,
                    status="insufficient_data",
                    confidence=1.0,
                    explanation=(
                        f"No relevant bidder evidence was found for the "
                        f"{domain or 'required'} compliance domain."
                    ),
                ),
            )

        else:
            # An explicit missing-document statement is a deterministic
            # non-compliance signal; do not let the LLM reinterpret it.
            evidence_text_norm = _normalise_text(evidence.evidence_text)
            explicit_missing = any(
                phrase in evidence_text_norm
                for phrase in (
                    "not provided",
                    "not submitted",
                    "not available",
                    "not included",
                    "no authorization",
                    "no authorisation",
                    "authorization was not provided",
                    "authorisation was not provided",
                )
            )
            if explicit_missing and domain in {"oem", "gst", "pan", "udyam", "bis", "financial"}:
                ai_result = {
                    "status": "non_compliant",
                    "confidence": min(1.0, max(0.85, evidence.confidence or 0.95)),
                    "explanation": (
                        f"The bidder evidence explicitly states that the required "
                        f"{domain.replace('_', ' ')} document or authorization was not provided."
                    ),
                    "model_used": "deterministic-guardrail",
                    "provider": "system",
                }
            else:
                ai_result = await analyze_compliance_with_ai(
                    requirement_text=requirement.requirement_text,
                    evidence_text=evidence.evidence_text,
                    model_id=model_id,
                )

            result = create_compliance_result(
                db,
                ComplianceResultCreate(
                    project_id=project_id,
                    requirement_id=requirement.id,
                    evidence_id=evidence.id,
                    status=ai_result["status"],
                    confidence=ai_result["confidence"],
                    explanation=ai_result["explanation"],
                ),
            )

        analyzed += 1

        record_audit(
            db,
            action="compliance_analysis",
            project_id=project_id,
            actor="ai",
            details={
                "requirement_id": requirement.id,
                "requirement_domain": domain,
                "evidence_id": result.evidence_id,
                "status": result.status,
                "confidence": result.confidence,
            },
        )

    return calculate_compliance_summary(
        db,
        project_id,
    )


# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

def calculate_compliance_summary(
    db: Session,
    project_id: int,
) -> dict:
    requirements = list(
        db.scalars(
            select(Requirement)
            .where(Requirement.project_id == project_id)
        ).all()
    )

    results = get_compliance_results(
        db,
        project_id,
    )

    # Latest result wins for each requirement.
    latest: dict[int, ComplianceResult] = {}

    for result in results:
        latest[result.requirement_id] = result

    counts = defaultdict(int)

    total_weight = 0.0
    achieved_weight = 0.0

    mandatory_failures: list[dict] = []

    for requirement in requirements:
        weight = 2.0 if requirement.is_mandatory else 1.0

        total_weight += weight

        result = latest.get(requirement.id)

        if result is None:
            counts["unevaluated"] += 1

            if requirement.is_mandatory:
                mandatory_failures.append(
                    {
                        "requirement_id": requirement.id,
                        "title": requirement.title,
                        "reason": "Not evaluated",
                    }
                )

            continue

        counts[result.status] += 1

        if result.status == "compliant":
            achieved_weight += weight

        elif result.status in {
            "partial",
            "needs_review",
        }:
            achieved_weight += weight * 0.5

        if (
            requirement.is_mandatory
            and result.status != "compliant"
        ):
            mandatory_failures.append(
                {
                    "requirement_id": requirement.id,
                    "title": requirement.title,
                    "reason": result.status.replace(
                        "_",
                        " ",
                    ).title(),
                }
            )

    score = (
        round(
            (achieved_weight / total_weight) * 100
        )
        if total_weight
        else 0
    )

    if mandatory_failures or score < 70:
        risk = "high"
    elif score < 85:
        risk = "medium"
    else:
        risk = "low"

    return {
        "project_id": project_id,
        "total_requirements": len(requirements),
        "evaluated_requirements": len(latest),
        "unevaluated_requirements": counts["unevaluated"],
        "compliant": counts["compliant"],
        "partial": counts["partial"],
        "non_compliant": counts["non_compliant"],
        "needs_review": counts["needs_review"],
        "insufficient_data": counts["insufficient_data"],
        "compliance_score": score,
        "risk_level": risk,
        "mandatory_failures": mandatory_failures,
    }