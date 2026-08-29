"""
Phase 2 of the modeling pipeline (Section 6): estimates P(treatment | X)
so later estimators (IPW, Doubly Robust) can correct for non-random
treatment assignment. A logistic regression / gradient-boosted classifier
in practice — left as a clear extension point here.
"""


class PropensityModel:
    def fit(self, X, T):
        """Fit P(T=1 | X). X = confounders, T = treatment indicator."""
        raise NotImplementedError("Fit a classifier (e.g. sklearn LogisticRegression) here.")

    def predict_proba(self, X):
        raise NotImplementedError
