"""
Application entrypoint. Responsibilities kept deliberately narrow:
create the FastAPI app, wire in CORS, mount the v1 router, and expose a
startup hook. All actual logic lives in api/ -> services/ -> causal_engine/
or database/ (see README.md for the full request-flow diagram).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Causal Personalization Under Behavioral Drift — research API",
)

# Next.js dev server; tighten this list for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.on_event("startup")
def on_startup() -> None:
    """
    Fails loudly on boot if the database is unreachable, instead of the
    first request. Table creation itself is handled by scripts/init_db.py
    (see docker-compose.yml command), not here.
    """
    from app.database.session import engine
    with engine.connect():
        pass
