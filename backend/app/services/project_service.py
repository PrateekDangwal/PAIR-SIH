from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: ProjectCreate) -> Project:
        project = Project(
            name=data.name,
            description=data.description,
            gem_tender_id=data.gem_tender_id,
            status="active",
        )
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def get(self, project_id: int) -> Project:
        project = self.db.get(Project, project_id)
        if not project:
            raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
        return project

    def update(self, project_id: int, data: ProjectUpdate) -> Project:
        project = self.get(project_id)
        for key, value in data.model_dump(exclude_none=True).items():
            setattr(project, key, value)
        self.db.commit()
        self.db.refresh(project)
        return project

    def list_all(self, skip: int = 0, limit: int = 100) -> tuple[list[Project], int]:
        projects = list(
            self.db.scalars(
                select(Project).order_by(Project.created_at.desc()).offset(skip).limit(limit)
            )
        )
        total = self.db.scalar(select(func.count()).select_from(Project)) or 0
        return projects, total


