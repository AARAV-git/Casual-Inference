"""
Shared interface every dataset adapter implements. Keeping loaders behind
one interface means the causal engine and services never need to know
which raw source a dataset came from — they only call load_processed().
"""
from abc import ABC, abstractmethod

import pandas as pd

from app.config import get_settings


class BaseLoader(ABC):
    def __init__(self):
        self.settings = get_settings()

    @abstractmethod
    def load_raw(self) -> pd.DataFrame:
        """Reads the untouched files under data/raw/<source>/. Never modifies them."""

    @abstractmethod
    def to_canonical_schema(self, raw: pd.DataFrame) -> pd.DataFrame:
        """Maps source-specific columns onto the canonical interaction schema (Section 2.7)."""

    def load_processed(self, dataset_id: str) -> pd.DataFrame | None:
        """Reads the already-converted Parquet file from data/processed/, if it exists."""
        import os
        path = os.path.join(self.settings.processed_data_dir, f"{dataset_id}.parquet")
        if not os.path.exists(path):
            return None
        return pd.read_parquet(path)
