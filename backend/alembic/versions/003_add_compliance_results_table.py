"""add compliance results table

Revision ID: 003_add_compliance_results_table
Revises: 002_sprint3_evidence
Create Date: 2026-08-28
"""

from alembic import op
import sqlalchemy as sa


revision = "003_add_compliance_results_table"
down_revision = "002_sprint3_evidence"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "compliance_results",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "project_id",
            sa.Integer(),
            sa.ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "requirement_id",
            sa.Integer(),
            sa.ForeignKey("requirements.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "evidence_id",
            sa.Integer(),
            sa.ForeignKey("evidence.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("explanation", sa.Text(), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index("ix_compliance_results_id", "compliance_results", ["id"])
    op.create_index(
        "ix_compliance_results_project_id",
        "compliance_results",
        ["project_id"],
    )
    op.create_index(
        "ix_compliance_results_requirement_id",
        "compliance_results",
        ["requirement_id"],
    )
    op.create_index(
        "ix_compliance_results_evidence_id",
        "compliance_results",
        ["evidence_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_compliance_results_evidence_id", table_name="compliance_results")
    op.drop_index("ix_compliance_results_requirement_id", table_name="compliance_results")
    op.drop_index("ix_compliance_results_project_id", table_name="compliance_results")
    op.drop_index("ix_compliance_results_id", table_name="compliance_results")
    op.drop_table("compliance_results")
