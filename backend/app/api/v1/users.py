"""User Behavior Explorer endpoints (Section 7.3)."""
from fastapi import APIRouter, Query

router = APIRouter()


@router.get("")
def search_users(dataset_id: str = Query(...), search: str | None = None):
    raise NotImplementedError("Query the users table in data/processed/<dataset_id>.parquet")


@router.get("/{user_id}")
def get_user(user_id: str):
    """Returns activity level and preference vector, e.g. {thriller: 0.84, comedy: 0.21, ...}."""
    raise NotImplementedError


@router.get("/{user_id}/interactions")
def get_user_interactions(user_id: str, start_date: str | None = None, end_date: str | None = None, limit: int = 100):
    """Renders as: User -> Interaction timeline -> Intervention -> Outcome."""
    raise NotImplementedError
