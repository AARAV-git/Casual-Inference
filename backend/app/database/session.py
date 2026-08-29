"""
This is the actual backend <-> database connection.

- `engine` opens a connection pool to Postgres using the URL built in
  app/config.py (POSTGRES_* env vars -> postgresql+psycopg2://...).
- `SessionLocal` is a factory for short-lived DB sessions, one per request.
- `get_db()` is a FastAPI dependency: each route that needs the database
  declares `db: Session = Depends(get_db)` and gets a fresh session that is
  guaranteed to close afterwards, even if the route raises.

Nothing outside this file should call `create_engine` directly — every
other module gets its DB access through `get_db()`.
"""
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config import get_settings

settings = get_settings()

db_url = settings.database_url
if db_url.startswith("sqlite"):
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
        echo=settings.debug,
    )
else:
    engine = create_engine(
        db_url,
        pool_pre_ping=True,   # detects and replaces dead connections (e.g. after DB restart)
        pool_size=10,
        max_overflow=20,
        echo=settings.debug,  # logs SQL in dev, silent in prod
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
