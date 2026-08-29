"""
Central settings object. Everything the rest of the app needs (DB URL, data
paths, MLflow URI, feature flags) is read from here — nowhere else in the
codebase should call os.environ directly. That keeps configuration in one
place and makes it trivial to override values in tests.

Values are loaded from a .env file (see .env.example) via pydantic-settings.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- App ---
    app_name: str = "causal-personalization-backend"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    debug: bool = True

    # --- Database ---
    postgres_user: str = "causal_admin"
    postgres_password: str = "change_me"
    postgres_db: str = "causal_personalization"
    postgres_host: str = "db"
    postgres_port: int = 5432
    database_url_override: str | None = None

    # --- Data paths (Parquet — see Section 5.1 of the project overview) ---
    data_root: str = "./data"
    raw_data_dir: str = "./data/raw"
    processed_data_dir: str = "./data/processed"
    synthetic_data_dir: str = "./data/synthetic"

    # --- MLflow ---
    mlflow_tracking_uri: str = "./experiments/mlruns"

    @property
    def database_url(self) -> str:
        """
        SQLAlchemy connection string, assembled from the individual
        POSTGRES_* fields or returned directly if database_url_override is set.
        """
        if self.database_url_override:
            return self.database_url_override
        return (
            f"postgresql+psycopg2://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


@lru_cache
def get_settings() -> Settings:
    """Cached so the .env file is parsed once per process, not per request."""
    return Settings()
