"""
Creates every table defined in app/database/models.py if it doesn't
already exist. Run once before the API starts (see the `backend` service
command in docker-compose.yml) — for real schema changes later, replace
this with Alembic migrations instead of editing tables in place.
"""
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.database.base import Base
from app.database.session import engine
from app.database import models  # noqa: F401  (import registers all model classes with Base.metadata)


def init_db() -> None:
    print(f"Connecting to {engine.url.render_as_string(hide_password=True)} ...")
    Base.metadata.create_all(bind=engine)
    print("Tables ready:", ", ".join(Base.metadata.tables.keys()))


if __name__ == "__main__":
    init_db()
