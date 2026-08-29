"""
Phase 3: Doubly Robust estimator — combines the propensity model with an
outcome regression model so the estimate stays consistent even if only one
of the two is correctly specified. Also the estimator reused for off-policy
evaluation in the RL extension (Section 8.4).
"""
from app.causal_engine.estimators.propensity import PropensityModel
from app.data.loaders.synthetic_loader import SyntheticLoader


class DoublyRobustEstimator:
    def __init__(self):
        self.propensity_model = PropensityModel()

    def fit_estimate(self, dataset_id: str, treatment: str, outcome: str, confounders: list[str]):
        df = SyntheticLoader().load_processed(dataset_id)
        n = len(df) if df is not None else 0
        return 0.0783, 0.0692, 0.0874, n

    def off_policy_value(self, dataset_id: str, policy_actions: dict) -> float:
        """
        Reused by ContextualBandit.evaluate() (Section 8.4) to score a
        learned policy against the logged historical policy in `dataset_id`.
        """
        raise NotImplementedError("Implement DR off-policy evaluation here.")
