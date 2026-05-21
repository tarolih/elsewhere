"""initial

Revision ID: 0001_initial
Revises:
Create Date: 2026-05-21
"""

from alembic import op

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    from app.database import Base
    from app.models import *  # noqa: F401,F403

    Base.metadata.create_all(bind=bind)


def downgrade() -> None:
    bind = op.get_bind()
    from app.database import Base
    from app.models import *  # noqa: F401,F403

    Base.metadata.drop_all(bind=bind)
