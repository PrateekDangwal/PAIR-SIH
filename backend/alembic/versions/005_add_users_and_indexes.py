"""Add authentication users and performance indexes."""
from alembic import op
import sqlalchemy as sa

revision = "005_add_users_and_indexes"
down_revision = "004_add_audit_events"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("password_hash", sa.String(length=512), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index(
        "ix_compliance_results_project_requirement_id",
        "compliance_results",
        ["project_id", "requirement_id", "id"],
    )
    op.create_index(
        "ix_evidence_project_created_id",
        "evidence",
        ["project_id", "created_at", "id"],
    )
    op.create_index(
        "ix_documents_project_created_id",
        "documents",
        ["project_id", "created_at", "id"],
    )


def downgrade() -> None:
    op.drop_index("ix_documents_project_created_id", table_name="documents")
    op.drop_index("ix_evidence_project_created_id", table_name="evidence")
    op.drop_index("ix_compliance_results_project_requirement_id", table_name="compliance_results")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_id", table_name="users")
    op.drop_table("users")
