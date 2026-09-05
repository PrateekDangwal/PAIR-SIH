"""Sprint 3: Add evidence table for vendor document evidence extraction

Revision ID: 002
Revises: 001
Create Date: 2025-01-02 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "evidence",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("project_id", sa.Integer(), nullable=False, index=True),
        sa.Column("source_document_id", sa.Integer(), nullable=False, index=True),
        sa.Column("evidence_text", sa.Text(), nullable=False),
        sa.Column("evidence_type", sa.String(100), server_default="other"),
        sa.Column("source_page_number", sa.Integer(), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("extracted_by_model", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["source_document_id"], ["documents.id"], ondelete="CASCADE"
        ),
    )


def downgrade() -> None:
    op.drop_table("evidence")
