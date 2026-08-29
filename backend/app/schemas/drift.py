from pydantic import BaseModel


class DriftCausalRequest(BaseModel):
    dataset_id: str
    treatment: str
    behavior_variable: str
    time_window: str = "7d"


class DriftCausalResponse(BaseModel):
    total_drift: float
    natural_drift: float
    ai_induced_drift: float


class DriftTimelinePoint(BaseModel):
    period: str
    drift: float


class DriftPopulationResponse(BaseModel):
    timeline: list[DriftTimelinePoint]
