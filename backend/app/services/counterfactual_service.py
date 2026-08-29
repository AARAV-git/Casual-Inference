from app.causal_engine.models.transformer_encoder import TransformerUserEncoder
from app.schemas.counterfactual import (
    CounterfactualOutcome, CounterfactualRequest, CounterfactualResponse,
)


class CounterfactualService:
    """Wraps the trained model used to predict Y(1) and Y(0) for one user."""

    def __init__(self):
        self.encoder = TransformerUserEncoder()

    def simulate(self, req: CounterfactualRequest) -> CounterfactualResponse:
        observed_value = self.encoder.predict(req.user_id, req.observed_treatment, req.outcome)
        counterfactual_value = self.encoder.predict(req.user_id, req.counterfactual_treatment, req.outcome)

        return CounterfactualResponse(
            user_id=req.user_id,
            observed=CounterfactualOutcome(treatment=req.observed_treatment, predicted_value=observed_value),
            counterfactual=CounterfactualOutcome(treatment=req.counterfactual_treatment, predicted_value=counterfactual_value),
            estimated_effect=observed_value - counterfactual_value,
        )
