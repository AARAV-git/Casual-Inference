from pydantic import BaseModel


class CounterfactualRequest(BaseModel):
    user_id: str
    observed_treatment: str
    counterfactual_treatment: str
    outcome: str


class CounterfactualOutcome(BaseModel):
    treatment: str
    predicted_value: float


class CounterfactualResponse(BaseModel):
    user_id: str
    observed: CounterfactualOutcome
    counterfactual: CounterfactualOutcome
    estimated_effect: float


class PolicyComparisonRequest(BaseModel):
    user_id: str
    policies: list[str]
    outcome: str


class PolicyComparisonResult(BaseModel):
    policy: str
    predicted_value: float


class PolicyComparisonResponse(BaseModel):
    results: list[PolicyComparisonResult]
