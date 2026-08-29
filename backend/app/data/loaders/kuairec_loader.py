"""Primary real-world dataset (Section 4.1) — comes from an actual recommendation environment with exposure info."""
import pandas as pd

from app.data.loaders.base_loader import BaseLoader


class KuaiRecLoader(BaseLoader):
    def load_raw(self) -> pd.DataFrame:
        raise NotImplementedError("Read files from data/raw/kuairec/")

    def to_canonical_schema(self, raw: pd.DataFrame) -> pd.DataFrame:
        raise NotImplementedError("Map KuaiRec columns onto the canonical interaction schema (Sec. 2.7)")
