from app.config import get_settings


def test_settings_load():
    settings = get_settings()
    assert settings.app_name == "causal-personalization-backend"
    assert settings.api_v1_prefix == "/api/v1"
    assert settings.database_url is not None
