"""
Shared evaluation metrics used across Phases 1-7: PEHE, AUUC, Qini
coefficient, and ATE estimation error against synthetic ground truth
(Section 4.2). Used by the Experiment Lab's model-comparison table.
"""


def pehe(true_ite, predicted_ite) -> float:
    """Precision in Estimation of Heterogeneous Effect — RMSE of ITE."""
    raise NotImplementedError


def auuc(uplift_scores, outcomes, treatment) -> float:
    """Area Under the Uplift Curve."""
    raise NotImplementedError


def qini_coefficient(uplift_scores, outcomes, treatment) -> float:
    raise NotImplementedError


def ate_error(true_ate: float, estimated_ate: float) -> float:
    return abs(true_ate - estimated_ate)
