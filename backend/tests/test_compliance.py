from app.models.compliance import ComplianceResult
from app.models.evidence import Evidence
from app.models.project import Project
from app.models.requirement import Requirement
from app.schemas.compliance import ComplianceResultCreate
from app.services.compliance_service import create_compliance_result, get_compliance_results


def test_create_and_list_compliance_result(db):
    project = Project(name="Compliance Project")
    db.add(project)
    db.commit()
    db.refresh(project)

    requirement = Requirement(
        project_id=project.id,
        source_document_id=1,
        title="RAM",
        requirement_text="RAM must be at least 16GB",
    )
    db.add(requirement)
    db.commit()
    db.refresh(requirement)

    # Evidence needs a valid source document in the real DB, so test the
    # compliance service without attaching evidence.
    payload = ComplianceResultCreate(
        project_id=project.id,
        requirement_id=requirement.id,
        status="compliant",
        explanation="Requirement satisfied.",
        confidence=0.95,
    )

    result = create_compliance_result(db, payload)

    assert isinstance(result, ComplianceResult)
    assert result.project_id == project.id
    assert result.requirement_id == requirement.id
    assert result.status == "compliant"

    results = get_compliance_results(db, project.id)
    assert len(results) == 1
    assert results[0].id == result.id
