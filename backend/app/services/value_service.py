"""
Backs GET /value/{user_id} (Section 3, new addition to the project
overview). Computed fresh from data/processed/outcomes.parquet on every
call — nothing about a user's value score is persisted to Postgres, since
it's cheap to recompute and always reflects the latest outcome data.
"""
from app.data.loaders.synthetic_loader import SyntheticLoader

# Default value-function weights — can be overridden per request/experiment
# once weight-fitting (regressing subscription continuation on the
# component signals) is implemented.
DEFAULT_WEIGHTS = {
    "watch_time": 0.35,
    "completion_ratio": 0.20,
    "retention_7d": 0.25,
    "session_frequency": 0.15,
    "churn_risk": -0.30,
}


class ValueService:
    def __init__(self):
        self.loader = SyntheticLoader()

    def get_value_breakdown(self, user_id: str, weights: dict[str, float] | None = None) -> dict:
        """
        Returns V = w1*watch_time + w2*completion_ratio + w3*retention_7d
        + w4*session_frequency - w5*churn_risk, plus each component's raw
        contribution — consumed by the User Behavior Explorer and by
        PolicyService as the bandit's reward signal (Section 8.3).
        """
        weights = weights or DEFAULT_WEIGHTS
        raise NotImplementedError(
            "Load this user's outcome row from data/processed/outcomes.parquet "
            "and compute the weighted sum against `weights`."
        )
