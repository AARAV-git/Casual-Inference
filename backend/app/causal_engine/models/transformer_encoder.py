"""
Phase 5-6: sequential user representation. Encodes a user's interaction
history (Section 2.2) into an embedding, which Phase 6 feeds into the
causal estimator instead of static confounders — this is the ablation
that tests whether sequence modeling improves causal estimation.
"""


class TransformerUserEncoder:
    def encode(self, user_id: str):
        """Returns a fixed-size embedding of the user's interaction history."""
        raise NotImplementedError("Load interaction history and run it through a torch Transformer encoder.")

    def predict(self, user_id: str, treatment: str, outcome: str) -> float:
        """
        Used by CounterfactualService: predicts the outcome value for a
        given (user, treatment) pair — i.e. Y(1) or Y(0).
        """
        # Placeholder deterministic value so the counterfactual endpoint is runnable end-to-end.
        base = 30.0
        bump = 12.7 if treatment == "personalized" else 0.0
        return base + bump
