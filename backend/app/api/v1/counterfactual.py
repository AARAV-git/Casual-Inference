"""Counterfactual Simulator endpoints (Section 7.3) — one of the strongest parts of the app."""
from fastapi import APIRouter

from app.schemas.counterfactual import (
    CounterfactualRequest, CounterfactualResponse, PolicyComparisonRequest, PolicyComparisonResponse,
)
from app.services.counterfactual_service import CounterfactualService

router = APIRouter()


@router.post("/simulate", response_model=CounterfactualResponse)
def simulate_counterfactual(req: CounterfactualRequest):
    return CounterfactualService().simulate(req)


@router.post("/compare-policies", response_model=PolicyComparisonResponse)
def compare_policies(req: PolicyComparisonRequest):
    """Compares several intervention policies for one user and returns predicted outcomes for each."""
    raise NotImplementedError
