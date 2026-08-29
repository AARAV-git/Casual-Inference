"""Intervention Explorer endpoints (Section 7.3)."""
from fastapi import APIRouter

router = APIRouter()


@router.get("")
def list_interventions():
    return [
        {"id": "personalized", "name": "Personalized Recommendation", "treatment": 1},
        {"id": "generic", "name": "Generic Recommendation", "treatment": 0},
    ]


@router.get("/{intervention_id}/statistics")
def get_intervention_statistics(intervention_id: str):
    raise NotImplementedError("exposed_users, average_watch_time, estimated_ate for this intervention")
