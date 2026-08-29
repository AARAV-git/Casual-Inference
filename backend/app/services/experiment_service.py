from sqlalchemy.orm import Session

from app.database.models import Experiment, ExperimentRun
from app.database.repositories import ExperimentRepository
from app.schemas.experiments import (
    ExperimentCreateRequest, ExperimentCreateResponse,
    ExperimentResultsResponse, ExperimentStatusResponse, ModelResult,
)


class ExperimentService:
    """
    Backs the Experiment Lab (Section 7.3, page 6 of the overview): a
    multi-model comparison run (XGBoost / IPW / DR / Causal Forest /
    Transformer+DR). Actual training is dispatched to a background worker
    in a real deployment; this stub shows the persistence contract.
    """

    def __init__(self, db: Session):
        self.db = db
        self.repo = ExperimentRepository(db)

    def create(self, req: ExperimentCreateRequest) -> ExperimentCreateResponse:
        experiment = self.repo.create(
            Experiment(
                name=req.name,
                dataset_id=req.dataset_id,
                treatment=req.treatment,
                outcome=req.outcome,
                estimator=",".join(req.models),
                status="queued",
            )
        )
        # In production: enqueue a background task here (e.g. Celery/RQ)
        # that runs each model and streams progress via websocket_manager.
        return ExperimentCreateResponse(experiment_id=experiment.id, status="queued")

    def status(self, experiment_id: str) -> ExperimentStatusResponse:
        experiment = self.repo.get(experiment_id)
        latest_run = max(experiment.runs, key=lambda r: r.logged_at, default=None) if experiment.runs else None
        return ExperimentStatusResponse(
            id=experiment.id,
            status=experiment.status,
            progress=latest_run.progress if latest_run else 0,
        )

    def results(self, experiment_id: str) -> ExperimentResultsResponse:
        experiment = self.repo.get(experiment_id)
        models = [
            ModelResult(model=r.result_type, pehe=None, auuc=None, qini=None)
            for r in experiment.causal_results
        ]
        return ExperimentResultsResponse(models=models)
