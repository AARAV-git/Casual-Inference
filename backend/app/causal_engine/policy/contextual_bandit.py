"""
Phase 7 / Section 8 of the project overview: the RL policy-learning
extension. A contextual bandit (Thompson Sampling or LinUCB) rather than
deep RL, because interventions are single-step decisions — see Section 8.2
of the project overview for the justification.
"""


class ContextualBandit:
    def __init__(self, algorithm: str = "thompson_sampling"):
        self.algorithm = algorithm  # "thompson_sampling" | "lin_ucb"

    def fit(self, dataset_id: str, reward_weights: dict[str, float]):
        """
        Trains on data/synthetic/policy/ (context, action, reward logs).
        `reward_weights` is the value function from Section 3
        (watch_time, completion_ratio, retention_7d, session_frequency,
        churn_risk) — this is what makes the bandit's objective a genuine
        value-based model rather than a copy of the ATE estimator.
        """
        raise NotImplementedError("Fit a Thompson Sampling / LinUCB bandit here.")

    def recommend(self, user_id: str) -> tuple[str, float]:
        """Returns (chosen_intervention, expected_reward) for one user/context."""
        raise NotImplementedError

    def evaluate(self) -> tuple[float, float]:
        """
        Returns (online_regret, offline_policy_value). Online regret is
        computed in-simulator against the known ground-truth reward model
        (Sec. 4.2); offline policy value reuses DoublyRobustEstimator
        .off_policy_value() against KuaiRec's logged policy (Sec. 8.4).
        """
        raise NotImplementedError
