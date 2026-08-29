"""Policy Lab endpoints (Section 8) — the RL/contextual-bandit extension."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.policy import (
    PolicyEvaluateResponse, PolicyRecommendResponse, PolicyTrainRequest, PolicyTrainResponse,
)
from app.services.policy_service import PolicyService

router = APIRouter()


@router.post("/train", response_model=PolicyTrainResponse)
def train_policy(req: PolicyTrainRequest, db: Session = Depends(get_db)):
    return PolicyService(db).train(req)


@router.get("/{policy_id}/recommend/{user_id}", response_model=PolicyRecommendResponse)
def recommend(policy_id: str, user_id: str, db: Session = Depends(get_db)):
    return PolicyService(db).recommend(policy_id, user_id)


@router.get("/{policy_id}/evaluate", response_model=PolicyEvaluateResponse)
def evaluate_policy(policy_id: str, db: Session = Depends(get_db)):
    return PolicyService(db).evaluate(policy_id)
