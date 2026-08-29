import pytest
from app.services.value_service import ValueService, DEFAULT_WEIGHTS


def test_value_service_weights():
    assert "watch_time" in DEFAULT_WEIGHTS
    assert "churn_risk" in DEFAULT_WEIGHTS
    service = ValueService()
    assert service.loader is not None
