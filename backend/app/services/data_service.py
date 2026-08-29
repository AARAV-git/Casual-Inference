"""
Thin read layer over data that doesn't need its own dedicated service:
Dataset metadata (/datasets, /dashboard), the Model Registry (/models),
and Research write-ups (/research). Grouped here because none of these
run causal/ML logic — they're lookups, not computations.
"""
from pathlib import Path

from sqlalchemy.orm import Session

from app.config import get_settings
from app.database.repositories import DatasetRepository, ModelRepository


class DataService:
    def __init__(self, db: Session):
        self.settings = get_settings()
        self.dataset_repo = DatasetRepository(db)
        self.model_repo = ModelRepository(db)

    # --- Datasets (Dataset Explorer + Dashboard) ---
    def list_datasets(self):
        return self.dataset_repo.list()

    def get_dataset(self, dataset_id: str):
        return self.dataset_repo.get(dataset_id)

    # --- Model Registry ---
    def list_models(self):
        return self.model_repo.list()

    def get_model(self, model_id: str):
        return self.model_repo.get(model_id)

    def get_model_metrics(self, model_id: str) -> dict | None:
        model = self.model_repo.get(model_id)
        return model.metrics if model else None

    # --- Research (plain markdown files under research/, not Postgres) ---
    def get_research_section(self, section: str) -> str:
        """
        Reads research/<section>/*.md and returns the concatenated content.
        `section` is one of: literature_review, hypotheses, methodology, experiments.
        """
        section_dir = Path(self.settings.data_root).parent / "research" / section
        raise NotImplementedError(f"Read and concatenate markdown files from {section_dir}")
