"""
Aggregates every domain router under one prefix. This is the only file
main.py imports from app/api — add a new feature by writing a new router
module and registering it here, nothing else needs to change.
"""
from fastapi import APIRouter

from app.api.v1 import (
    causal, counterfactual, dashboard, datasets, drift, experiments,
    health, interventions, models, policy, research, users, value,
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(datasets.router, prefix="/datasets", tags=["datasets"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(interventions.router, prefix="/interventions", tags=["interventions"])
api_router.include_router(value.router, prefix="/value", tags=["value"])
api_router.include_router(causal.router, prefix="/causal", tags=["causal"])
api_router.include_router(counterfactual.router, prefix="/counterfactual", tags=["counterfactual"])
api_router.include_router(drift.router, prefix="/drift", tags=["drift"])
api_router.include_router(experiments.router, prefix="/experiments", tags=["experiments"])
api_router.include_router(policy.router, prefix="/policy", tags=["policy"])
api_router.include_router(models.router, prefix="/models", tags=["models"])
api_router.include_router(research.router, prefix="/research", tags=["research"])

# Registered at the top level (not on experiments.router) so the final
# path is /api/v1/ws/experiments/{id} — matching the documented
# frontend<->backend connection chain exactly, instead of inheriting
# the /experiments prefix.
api_router.add_api_websocket_route(
    "/ws/experiments/{experiment_id}", experiments.experiment_progress_ws
)
