"""
Causal Analysis endpoints — the heart of the app (Section 7.3). Routes
stay thin: validate input via the Pydantic schema, call CausalService,
return its response. No estimation logic lives here.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.causal import (
    CateRequest, CateResponse, CausalEstimateRequest, CausalEstimateResponse, IteResponse,
)
from app.services.causal_service import CausalService

router = APIRouter()


@router.get("/treatments")
def get_available_treatments():
    return ["personalized_recommendation", "generic_recommendation", "trending_recommendation"]


@router.get("/outcomes")
def get_available_outcomes():
    return ["watch_time", "retention_7d", "retention_30d", "churn"]


@router.get("/features")
def get_available_confounders():
    return ["previous_watch_time", "previous_click_rate", "activity_level", "genre_preference"]


@router.post("/estimate", response_model=CausalEstimateResponse)
def estimate_causal_effect(req: CausalEstimateRequest, db: Session = Depends(get_db)):
    return CausalService(db).estimate(req)


@router.post("/cate", response_model=CateResponse)
def estimate_cate(req: CateRequest, db: Session = Depends(get_db)):
    raise NotImplementedError("Segment-level CATE via CausalForestEstimator.cate_by_segment()")


@router.get("/ite/{user_id}", response_model=IteResponse)
def estimate_ite(user_id: str, db: Session = Depends(get_db)):
    raise NotImplementedError("Individual treatment effect for one user")
