"""Behavioral Drift endpoints (Section 7.3) — population and per-user drift decomposition."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.drift import DriftCausalRequest, DriftCausalResponse, DriftPopulationResponse
from app.services.drift_service import DriftService

router = APIRouter()


@router.get("/population", response_model=DriftPopulationResponse)
def get_population_drift(dataset_id: str = Query(...), window: str = "7d", db: Session = Depends(get_db)):
    return DriftService(db).population(dataset_id)


@router.post("/causal", response_model=DriftCausalResponse)
def get_causal_drift(req: DriftCausalRequest, db: Session = Depends(get_db)):
    return DriftService(db).causal(req)


@router.get("/users/{user_id}")
def get_user_drift(user_id: str, db: Session = Depends(get_db)):
    """Per-user preference timeline plus estimated_causal_drift."""
    raise NotImplementedError
