"""Pydantic request/response contracts for the causal-analysis endpoints."""
from pydantic import BaseModel


class CausalEstimateRequest(BaseModel):
    dataset_id: str
    treatment: str
    outcome: str
    confounders: list[str]
    estimator: str = "doubly_robust"   # ipw | doubly_robust | causal_forest | transformer_dr


class CausalEstimateResponse(BaseModel):
    experiment_id: str
    estimator: str
    ate: float
    confidence_interval: tuple[float, float]
    sample_size: int


class CateRequest(BaseModel):
    experiment_id: str
    method: str = "causal_forest"


class CateSegment(BaseModel):
    segment: str
    cate: float


class CateResponse(BaseModel):
    segments: list[CateSegment]


class IteResponse(BaseModel):
    user_id: str
    treatment: str
    ite: float
    confidence_interval: tuple[float, float]
