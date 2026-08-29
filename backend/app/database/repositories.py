"""
Repository pattern: one class per table, wrapping the CRUD queries each
service actually needs. Services (app/services/*) depend on these classes,
never on `Session` or raw SQLAlchemy queries directly — that keeps the ORM
fully swappable and keeps query logic out of the route handlers.
"""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.models import (
    CausalResult, Dataset, DriftResult, Experiment, ExperimentRun, MLModel, Policy, PolicyEvaluation,
)


class DatasetRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self) -> list[Dataset]:
        return list(self.db.scalars(select(Dataset)))

    def get(self, dataset_id: str) -> Dataset | None:
        return self.db.get(Dataset, dataset_id)


class ExperimentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, experiment: Experiment) -> Experiment:
        self.db.add(experiment)
        self.db.commit()
        self.db.refresh(experiment)
        return experiment

    def get(self, experiment_id: str) -> Experiment | None:
        return self.db.get(Experiment, experiment_id)

    def add_run(self, run: ExperimentRun) -> ExperimentRun:
        self.db.add(run)
        self.db.commit()
        self.db.refresh(run)
        return run

    def add_causal_result(self, result: CausalResult) -> CausalResult:
        self.db.add(result)
        self.db.commit()
        self.db.refresh(result)
        return result


class DriftRepository:
    def __init__(self, db: Session):
        self.db = db

    def add(self, result: DriftResult) -> DriftResult:
        self.db.add(result)
        self.db.commit()
        self.db.refresh(result)
        return result

    def population_timeline(self, dataset_id: str) -> list[DriftResult]:
        stmt = (
            select(DriftResult)
            .where(DriftResult.dataset_id == dataset_id, DriftResult.scope == "population")
            .order_by(DriftResult.period)
        )
        return list(self.db.scalars(stmt))

    def for_user(self, user_id: str) -> list[DriftResult]:
        stmt = select(DriftResult).where(DriftResult.user_id == user_id).order_by(DriftResult.period)
        return list(self.db.scalars(stmt))


class ModelRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self) -> list[MLModel]:
        return list(self.db.scalars(select(MLModel)))

    def get(self, model_id: str) -> MLModel | None:
        return self.db.get(MLModel, model_id)

    def register(self, model: MLModel) -> MLModel:
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return model


class PolicyRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, policy: Policy) -> Policy:
        self.db.add(policy)
        self.db.commit()
        self.db.refresh(policy)
        return policy

    def get(self, policy_id: str) -> Policy | None:
        return self.db.get(Policy, policy_id)


class PolicyEvaluationRepository:
    def __init__(self, db: Session):
        self.db = db

    def add(self, evaluation: PolicyEvaluation) -> PolicyEvaluation:
        self.db.add(evaluation)
        self.db.commit()
        self.db.refresh(evaluation)
        return evaluation

    def latest_for_policy(self, policy_id: str) -> PolicyEvaluation | None:
        stmt = (
            select(PolicyEvaluation)
            .where(PolicyEvaluation.policy_id == policy_id)
            .order_by(PolicyEvaluation.created_at.desc())
        )
        return self.db.scalars(stmt).first()
