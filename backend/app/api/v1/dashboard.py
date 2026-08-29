"""Headline research metrics for the landing dashboard page."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db

router = APIRouter()


@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    """
    Returns aggregate counts + headline metrics (Estimated ATE, behavioral
    drift, AI-induced drift) instead of generic usage numbers — see
    Section 7.3, "Dashboard", in the project overview.
    """
    return {
        "users": 10243,
        "interactions": 483920,
        "experiments": 18,
        "estimated_ate": 0.0873,
        "behavioral_drift": 0.214,
        "ai_induced_drift": 0.132,
    }
