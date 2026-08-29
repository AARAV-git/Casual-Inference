from sqlalchemy.orm import Session

from app.causal_engine.policy.contextual_bandit import ContextualBandit
from app.database.models import Policy, PolicyEvaluation
from app.database.repositories import PolicyEvaluationRepository, PolicyRepository
from app.schemas.policy import (
    PolicyEvaluateResponse, PolicyRecommendResponse, PolicyTrainRequest, PolicyTrainResponse,
)


class PolicyService:
    """
    Section 8 of the project overview — trains a contextual bandit whose
    reward is the value function from Section 3, and evaluates it two ways:
    online regret (synthetic, known ground truth) and offline policy value
    (Doubly Robust off-policy evaluation, reusing doubly_robust.py — the
    same estimator /causal-analysis uses, pointed at a policy's logged
    actions instead of a static treatment column).
    """

    def __init__(self, db: Session):
        self.repo = PolicyRepository(db)
        self.eval_repo = PolicyEvaluationRepository(db)

    def train(self, req: PolicyTrainRequest) -> PolicyTrainResponse:
        policy = self.repo.create(
            Policy(
                name=f"{req.algorithm} on {req.dataset_id}",
                dataset_id=req.dataset_id,
                algorithm=req.algorithm,
                reward_definition=req.reward_definition,
                status="training",
            )
        )
        bandit = ContextualBandit(algorithm=req.algorithm)
        # Writes round-by-round context/action/reward logs to
        # data/synthetic/policy/ as it trains (see contextual_bandit.py).
        bandit.fit(dataset_id=req.dataset_id, reward_weights=req.reward_definition)
        policy.status = "ready"
        return PolicyTrainResponse(policy_id=policy.id, status=policy.status)

    def recommend(self, policy_id: str, user_id: str) -> PolicyRecommendResponse:
        policy = self.repo.get(policy_id)
        bandit = ContextualBandit(algorithm=policy.algorithm)
        intervention, expected_reward = bandit.recommend(user_id)
        return PolicyRecommendResponse(
            user_id=user_id, recommended_intervention=intervention, expected_reward=expected_reward
        )

    def evaluate(self, policy_id: str) -> PolicyEvaluateResponse:
        """
        Computes a fresh evaluation and stores it as a new row in
        policy_evaluations (rather than overwriting fields on Policy),
        so re-evaluating the same policy later keeps its history.
        """
        policy = self.repo.get(policy_id)
        bandit = ContextualBandit(algorithm=policy.algorithm)
        online_regret, offline_policy_value = bandit.evaluate()

        evaluation = self.eval_repo.add(
            PolicyEvaluation(
                policy_id=policy.id,
                online_regret=online_regret,
                offline_policy_value=offline_policy_value,
                evaluated_against=policy.dataset_id,
            )
        )
        return PolicyEvaluateResponse(
            policy_id=policy.id,
            online_regret=evaluation.online_regret,
            offline_policy_value=evaluation.offline_policy_value,
        )
