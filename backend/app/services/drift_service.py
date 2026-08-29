from sqlalchemy.orm import Session

from app.database.models import DriftResult
from app.database.repositories import DriftRepository
from app.schemas.drift import (
    DriftCausalRequest, DriftCausalResponse, DriftPopulationResponse, DriftTimelinePoint,
)


class DriftService:
    def __init__(self, db: Session):
        self.repo = DriftRepository(db)

    def population(self, dataset_id: str) -> DriftPopulationResponse:
        rows = self.repo.population_timeline(dataset_id)
        return DriftPopulationResponse(
            timeline=[DriftTimelinePoint(period=r.period, drift=r.total_drift) for r in rows]
        )

    def causal(self, req: DriftCausalRequest) -> DriftCausalResponse:
        # Placeholder decomposition — real implementation compares the
        # synthetic ground-truth simulator (Sec. 4.2) against observed drift
        # to separate natural vs. AI-induced change.
        total, natural, ai_induced = 0.31, 0.12, 0.19
        self.repo.add(
            DriftResult(
                dataset_id=req.dataset_id,
                scope="population",
                period="latest",
                total_drift=total,
                natural_drift=natural,
                ai_induced_drift=ai_induced,
            )
        )
        return DriftCausalResponse(total_drift=total, natural_drift=natural, ai_induced_drift=ai_induced)
