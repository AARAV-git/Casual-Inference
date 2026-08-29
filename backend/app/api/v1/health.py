"""Liveness/readiness check — hit by docker-compose healthchecks and uptime monitors."""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok"}
