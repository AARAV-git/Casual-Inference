"""Auxiliary/baseline dataset (Section 4.1) — no intervention/exposure info, used for early experimentation only."""
import pandas as pd

from app.data.loaders.base_loader import BaseLoader


class MovieLensLoader(BaseLoader):
    def load_raw(self) -> pd.DataFrame:
        raise NotImplementedError("Read files from data/raw/movielens/")

    def to_canonical_schema(self, raw: pd.DataFrame) -> pd.DataFrame:
        raise NotImplementedError("Map MovieLens columns onto the canonical interaction schema (Sec. 2.7)")
