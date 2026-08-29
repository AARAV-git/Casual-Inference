"""
ORM models for everything Postgres is responsible for (Section 5.3 of the
project overview: metadata only — experiments, models, causal_results,
drift_results, experiment_runs, policies. Bulk interaction data stays in
data/processed/*.parquet and is never mirrored into these tables).

Each class = one Postgres table. Relationships mirror how the frontend
pages actually query this data (e.g. an Experiment page needs its child
CausalResult rows and its ExperimentRun history in one join).
"""
import uuid
from datetime import datetime

from sqlalchemy import (
    JSON, DateTime, Enum, Float, ForeignKey, Integer, String, Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class Dataset(Base):
    """
    One row per registered dataset (KuaiRec, MIND, MovieLens, Synthetic v1,
    ...). Points at the Parquet files in data/processed/ rather than storing
    the data itself — see GET /datasets in app/api/v1/datasets.py.
    """
    __tablename__ = "datasets"

    id: Mapped[str] = mapped_column(String, primary_key=True)          # e.g. "kuai", "synthetic-v1"
    name: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)          # "observational" | "synthetic"
    processed_path: Mapped[str] = mapped_column(String, nullable=False)
    has_ground_truth: Mapped[bool] = mapped_column(default=False)
    status: Mapped[str] = mapped_column(String, default="pending")     # pending | ready | error
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    experiments: Mapped[list["Experiment"]] = relationship(back_populates="dataset")


class Experiment(Base):
    """
    One row per causal-estimation or model-comparison run kicked off from
    /causal-analysis or /experiments in the frontend (POST /causal/estimate,
    POST /experiments). ExperimentRun + CausalResult rows hang off this.
    """
    __tablename__ = "experiments"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String, nullable=False)
    dataset_id: Mapped[str] = mapped_column(ForeignKey("datasets.id"))
    treatment: Mapped[str] = mapped_column(String, nullable=False)
    outcome: Mapped[str] = mapped_column(String, nullable=False)
    confounders: Mapped[list] = mapped_column(JSON, default=list)
    estimator: Mapped[str] = mapped_column(String, nullable=False)     # ipw | doubly_robust | causal_forest | transformer_dr
    status: Mapped[str] = mapped_column(String, default="queued")      # queued | running | completed | failed
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    dataset: Mapped["Dataset"] = relationship(back_populates="experiments")
    runs: Mapped[list["ExperimentRun"]] = relationship(back_populates="experiment", cascade="all, delete-orphan")
    causal_results: Mapped[list["CausalResult"]] = relationship(back_populates="experiment", cascade="all, delete-orphan")


class ExperimentRun(Base):
    """
    Progress/status log for a running experiment — what the WS
    /ws/experiments/{id} endpoint streams to the frontend and what
    GET /experiments/{id} reads for polling fallback.
    """
    __tablename__ = "experiment_runs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    experiment_id: Mapped[str] = mapped_column(ForeignKey("experiments.id"))
    stage: Mapped[str] = mapped_column(String, nullable=False)   # e.g. "causal_forest", "transformer_encoder"
    progress: Mapped[int] = mapped_column(Integer, default=0)    # 0-100
    message: Mapped[str] = mapped_column(Text, nullable=True)
    logged_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    experiment: Mapped["Experiment"] = relationship(back_populates="runs")


class CausalResult(Base):
    """
    ATE/CATE/ITE output of one experiment. One Experiment can have several
    CausalResult rows (e.g. an overall ATE plus a CATE-per-segment
    breakdown) — `segment` is null for the overall ATE row.
    """
    __tablename__ = "causal_results"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    experiment_id: Mapped[str] = mapped_column(ForeignKey("experiments.id"))
    result_type: Mapped[str] = mapped_column(String, nullable=False)   # ate | cate | ite
    segment: Mapped[str] = mapped_column(String, nullable=True)        # e.g. "high_activity", or a user_id for ITE
    estimate: Mapped[float] = mapped_column(Float, nullable=False)
    ci_low: Mapped[float] = mapped_column(Float, nullable=True)
    ci_high: Mapped[float] = mapped_column(Float, nullable=True)
    sample_size: Mapped[int] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    experiment: Mapped["Experiment"] = relationship(back_populates="causal_results")


class DriftResult(Base):
    """
    Output of /drift/population and /drift/causal — population or
    per-user behavioral drift, decomposed into natural vs. AI-induced.
    """
    __tablename__ = "drift_results"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    dataset_id: Mapped[str] = mapped_column(ForeignKey("datasets.id"))
    scope: Mapped[str] = mapped_column(String, nullable=False)     # "population" | "user"
    user_id: Mapped[str] = mapped_column(String, nullable=True)    # set when scope == "user"
    period: Mapped[str] = mapped_column(String, nullable=False)    # e.g. "week_1"
    total_drift: Mapped[float] = mapped_column(Float, nullable=True)
    natural_drift: Mapped[float] = mapped_column(Float, nullable=True)
    ai_induced_drift: Mapped[float] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class MLModel(Base):
    """
    Model Registry (Section 7.3, page 8): one row per trained model
    version, backing GET /models and GET /models/{id}.
    Named MLModel (not Model) to avoid clashing with SQLAlchemy's own
    naming and with Pydantic's `Model` conventions.
    """
    __tablename__ = "models"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String, nullable=False)      # "Causal Forest", "Transformer + DR"
    version: Mapped[str] = mapped_column(String, nullable=False)
    dataset_id: Mapped[str] = mapped_column(ForeignKey("datasets.id"))
    hyperparameters: Mapped[dict] = mapped_column(JSON, default=dict)
    metrics: Mapped[dict] = mapped_column(JSON, default=dict)      # {"pehe": 0.08, "auuc": 0.35, "qini": 0.30}
    artifact_path: Mapped[str] = mapped_column(String, nullable=True)  # points into mlruns/ or models/checkpoints/
    status: Mapped[str] = mapped_column(String, default="ready")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Policy(Base):
    """
    Policy Learning / RL extension (Section 8 of the project overview).
    One row per trained bandit policy, backing POST /policy/train and
    GET /policy/{id}/recommend/{user_id}. Evaluation results live in the
    separate PolicyEvaluation table below, not as columns here, so a
    policy can be re-evaluated over time without overwriting history.
    """
    __tablename__ = "policies"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String, nullable=False)
    dataset_id: Mapped[str] = mapped_column(ForeignKey("datasets.id"))
    algorithm: Mapped[str] = mapped_column(String, default="thompson_sampling")  # or "lin_ucb"
    reward_definition: Mapped[dict] = mapped_column(JSON, default=dict)  # value-function weights, Sec. 3
    status: Mapped[str] = mapped_column(String, default="training")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    evaluations: Mapped[list["PolicyEvaluation"]] = relationship(
        back_populates="policy", cascade="all, delete-orphan"
    )


class PolicyEvaluation(Base):
    """
    Result of GET /policy/{id}/evaluate (Section 8.4). Kept separate from
    Policy so a policy can be evaluated repeatedly (e.g. after retraining,
    or against a different dataset for offline policy value) without
    losing prior evaluation runs.
    """
    __tablename__ = "policy_evaluations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    policy_id: Mapped[str] = mapped_column(ForeignKey("policies.id"))
    online_regret: Mapped[float] = mapped_column(Float, nullable=True)          # in-simulator, vs. known ground truth
    offline_policy_value: Mapped[float] = mapped_column(Float, nullable=True)   # DR off-policy estimate, via doubly_robust.py
    evaluated_against: Mapped[str] = mapped_column(String, nullable=True)       # dataset_id used for the offline estimate
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    policy: Mapped["Policy"] = relationship(back_populates="evaluations")
