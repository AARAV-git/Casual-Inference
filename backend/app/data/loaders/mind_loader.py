"""Secondary validation dataset (Section 4.1) — tests generalization beyond one recommendation domain."""
import pandas as pd

from app.data.loaders.base_loader import BaseLoader


class MindLoader(BaseLoader):
    def load_raw(self) -> pd.DataFrame:
        raise NotImplementedError("Read files from data/raw/mind/")

    def to_canonical_schema(self, raw: pd.DataFrame) -> pd.DataFrame:
        raise NotImplementedError("Map MIND columns onto the canonical interaction schema (Sec. 2.7)")
