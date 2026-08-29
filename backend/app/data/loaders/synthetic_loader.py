"""
Loads the controlled synthetic causal dataset (Section 4.2) — the one
with known ground truth (true_y0, true_y1, true_ite, true_cate). Used by
every estimator for validation and by the contextual bandit for training.
"""
import pandas as pd

from app.data.loaders.base_loader import BaseLoader


class SyntheticLoader(BaseLoader):
    def load_raw(self) -> pd.DataFrame:
        raise NotImplementedError("Read files from data/synthetic/<version>/")

    def to_canonical_schema(self, raw: pd.DataFrame) -> pd.DataFrame:
        # Synthetic data is generated directly in canonical form — no mapping needed.
        return raw

    def load_ground_truth(self, version: str = "v1") -> pd.DataFrame:
        """Reads data/synthetic/ground_truth/true_ate.csv, true_ite.csv, etc."""
        raise NotImplementedError
