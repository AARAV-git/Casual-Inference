"""Value-based modeling endpoint (Section 3, new addition)."""
from fastapi import APIRouter

from app.services.value_service import ValueService

router = APIRouter()


@router.get("/{user_id}")
def get_value_breakdown(user_id: str):
    """
    Returns the value-function decomposition for a user:
    V = w1*watch_time + w2*completion_ratio + w3*retention_7d
        + w4*session_frequency - w5*churn_risk
    Consumed by the User Behavior Explorer and the Policy Lab.
    """
    return ValueService().get_value_breakdown(user_id)
