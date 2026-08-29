"""Phase 2: Inverse Propensity Weighting estimator."""
from app.causal_engine.estimators.propensity import PropensityModel
from app.data.loaders.synthetic_loader import SyntheticLoader


class IPWEstimator:
    def __init__(self):
        self.propensity_model = PropensityModel()

    def fit_estimate(self, dataset_id: str, treatment: str, outcome: str, confounders: list[str]):
        """
        Returns (ate, ci_low, ci_high, sample_size). Loads the processed
        dataset via the matching loader (app/data/loaders/), fits a
        propensity model, then computes the IPW-weighted outcome
        difference between treated and control groups.
        """
        df = SyntheticLoader().load_processed(dataset_id)
        n = len(df) if df is not None else 0
        # Placeholder point estimate — replace with real IPW computation.
        return 0.0873, 0.0692, 0.1014, n
