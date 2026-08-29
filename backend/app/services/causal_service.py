"""
Business logic for causal estimation. Routes call this; this calls the
causal_engine (the actual math) and the repository (persistence). Keeping
this layer means app/api/v1/causal.py never touches SQLAlchemy or the
estimator classes directly — it only knows about this service's methods.
"""
from sqlalchemy.orm import Session

from app.causal_engine.estimators.doubly_robust import DoublyRobustEstimator
from app.causal_engine.estimators.causal_forest import CausalForestEstimator
from app.causal_engine.estimators.ipw import IPWEstimator
from app.database.models import CausalResult, Experiment
from app.database.repositories import ExperimentRepository
from app.schemas.causal import CausalEstimateRequest, CausalEstimateResponse

_ESTIMATORS = {
    "ipw": IPWEstimator,
    "doubly_robust": DoublyRobustEstimator,
    "causal_forest": CausalForestEstimator,
}


class CausalService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ExperimentRepository(db)

    def estimate(self, req: CausalEstimateRequest) -> CausalEstimateResponse:
        experiment = self.repo.create(
            Experiment(
                name=f"{req.treatment} -> {req.outcome}",
                dataset_id=req.dataset_id,
                treatment=req.treatment,
                outcome=req.outcome,
                confounders=req.confounders,
                estimator=req.estimator,
                status="running",
            )
        )

        estimator_cls = _ESTIMATORS.get(req.estimator, DoublyRobustEstimator)
        estimator = estimator_cls()
        # `.fit_estimate(...)` loads data/processed/<dataset_id> internally
        # (via app/data/loaders) and returns (ate, ci_low, ci_high, n)
        ate, ci_low, ci_high, n = estimator.fit_estimate(
            dataset_id=req.dataset_id,
            treatment=req.treatment,
            outcome=req.outcome,
            confounders=req.confounders,
        )

        self.repo.add_causal_result(
            CausalResult(
                experiment_id=experiment.id,
                result_type="ate",
                estimate=ate,
                ci_low=ci_low,
                ci_high=ci_high,
                sample_size=n,
            )
        )
        experiment.status = "completed"
        self.db.commit()

        return CausalEstimateResponse(
            experiment_id=experiment.id,
            estimator=req.estimator,
            ate=ate,
            confidence_interval=(ci_low, ci_high),
            sample_size=n,
        )
