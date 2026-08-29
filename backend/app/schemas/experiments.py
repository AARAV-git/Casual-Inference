from pydantic import BaseModel


class ExperimentCreateRequest(BaseModel):
    name: str
    dataset_id: str
    treatment: str
    outcome: str
    models: list[str]   # e.g. ["ipw", "doubly_robust", "causal_forest", "transformer_dr"]


class ExperimentCreateResponse(BaseModel):
    experiment_id: str
    status: str


class ExperimentStatusResponse(BaseModel):
    id: str
    status: str
    progress: int


class ModelResult(BaseModel):
    model: str
    pehe: float | None = None
    auuc: float | None = None
    qini: float | None = None


class ExperimentResultsResponse(BaseModel):
    models: list[ModelResult]
