"""Schemas for the RL / policy-learning extension (Section 8)."""
from pydantic import BaseModel


class PolicyTrainRequest(BaseModel):
    dataset_id: str
    algorithm: str = "thompson_sampling"   # or "lin_ucb"
    reward_definition: dict[str, float]    # value-function weights, Sec. 3


class PolicyTrainResponse(BaseModel):
    policy_id: str
    status: str


class PolicyRecommendResponse(BaseModel):
    user_id: str
    recommended_intervention: str
    expected_reward: float


class PolicyEvaluateResponse(BaseModel):
    policy_id: str
    online_regret: float | None = None
    offline_policy_value: float | None = None
