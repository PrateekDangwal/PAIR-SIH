from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.compliance import (
    ComplianceAnalysisRequest,
    ComplianceResultCreate,
    ComplianceResultResponse,
    ComplianceSummaryResponse,
)
from app.schemas.recommendation import RecommendationResponse
from app.services.audit_service import record_audit
from app.services.compliance_service import (
    analyze_all_requirements,
    analyze_compliance_with_ai,
    calculate_compliance_summary,
    create_compliance_result,
    get_compliance_results,
)
from app.ai.models import ProviderRequest
from app.ai.registry import ProviderRegistry

router = APIRouter(prefix="/compliance", tags=["Compliance"])


@router.post("/results", response_model=ComplianceResultResponse, status_code=201)
def create_result(payload: ComplianceResultCreate, db: Session = Depends(get_db)):
    try:
        result = create_compliance_result(db, payload)
        record_audit(db, "compliance_result_created", payload.project_id, "user", {
            "requirement_id": payload.requirement_id,
            "status": payload.status,
        })
        return result
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/projects/{project_id}/results", response_model=list[ComplianceResultResponse])
def list_results(project_id: int, db: Session = Depends(get_db)):
    return get_compliance_results(db, project_id)


@router.get("/projects/{project_id}/summary", response_model=ComplianceSummaryResponse)
def compliance_summary(project_id: int, db: Session = Depends(get_db)):
    return calculate_compliance_summary(db, project_id)


@router.post("/projects/{project_id}/analyze-all", response_model=ComplianceSummaryResponse)
async def analyze_all(project_id: int, db: Session = Depends(get_db)):
    try:
        return await analyze_all_requirements(db, project_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except (ValueError, RuntimeError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/recommendation", response_model=RecommendationResponse)
async def recommendation(project_id: int, db: Session = Depends(get_db)):
    summary = calculate_compliance_summary(db, project_id)
    provider = ProviderRegistry().get_provider("nvidia")
    request = ProviderRequest(
        system_prompt=(
            "You are PAIR, a procurement compliance advisor. Give a concise, "
            "evidence-based recommendation to a procurement officer. Never "
            "claim that the bidder is legally qualified; the officer makes the final decision."
        ),
        user_message=(
            "Review this compliance summary and provide 3-5 actionable recommendations.\n"
            "Use ONLY the supplied numbers. Never invent or recalculate requirement counts.\n"
            "Treat insufficient_data as unresolved evidence, not as a confirmed failure.\n"
            "Clearly distinguish non_compliant from insufficient_data and needs_review.\n"
            "Return concise, readable Markdown with headings and numbered recommendations.\n\n"
            f"{summary}"
        ),
        max_tokens=600,
        temperature=0.2,
    )
    try:
        response = await provider.generate_structured(request)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    record_audit(db, "recommendation_generated", project_id, "ai", {"model": response.model_used})
    return RecommendationResponse(
        project_id=project_id,
        recommendation=response.content,
        model_used=response.model_used,
        provider=response.provider,
    )


@router.post("/analyze", response_model=ComplianceResultResponse, status_code=201)
async def analyze_result(payload: ComplianceAnalysisRequest, db: Session = Depends(get_db)):
    try:
        ai_result = await analyze_compliance_with_ai(
            requirement_text=payload.requirement_text,
            evidence_text=payload.evidence_text,
            model_id=payload.model_id,
        )
        result = create_compliance_result(
            db,
            ComplianceResultCreate(
                project_id=payload.project_id,
                requirement_id=payload.requirement_id,
                evidence_id=payload.evidence_id,
                status=ai_result["status"],
                explanation=ai_result["explanation"],
                confidence=ai_result["confidence"],
            ),
        )
        record_audit(db, "compliance_analysis", payload.project_id, "ai", {
            "requirement_id": payload.requirement_id,
            "evidence_id": payload.evidence_id,
            "status": result.status,
            "model": ai_result.get("model_used"),
        })
        return result
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
