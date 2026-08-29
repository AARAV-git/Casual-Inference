"""
Experiment Lab endpoints (Section 7.3) — create a multi-model comparison
run, poll its status, fetch results, or subscribe to live progress over
WebSocket instead of polling.
"""
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.websocket_manager import websocket_manager
from app.database.session import get_db
from app.schemas.experiments import (
    ExperimentCreateRequest, ExperimentCreateResponse,
    ExperimentResultsResponse, ExperimentStatusResponse,
)
from app.services.experiment_service import ExperimentService

router = APIRouter()


@router.post("", response_model=ExperimentCreateResponse)
def create_experiment(req: ExperimentCreateRequest, db: Session = Depends(get_db)):
    return ExperimentService(db).create(req)


@router.get("/{experiment_id}", response_model=ExperimentStatusResponse)
def get_experiment_status(experiment_id: str, db: Session = Depends(get_db)):
    return ExperimentService(db).status(experiment_id)


@router.get("/{experiment_id}/results", response_model=ExperimentResultsResponse)
def get_experiment_results(experiment_id: str, db: Session = Depends(get_db)):
    return ExperimentService(db).results(experiment_id)


async def experiment_progress_ws(websocket: WebSocket, experiment_id: str):
    """
    Registered at the TOP LEVEL in app/api/v1/router.py (not on this
    router) so its final path is /api/v1/ws/experiments/{id} — not
    nested under this file's /experiments prefix, which would have
    produced /api/v1/experiments/ws/experiments/{id}.
    """
    await websocket_manager.connect(experiment_id, websocket)
    try:
        while True:
            await websocket.receive_text()   # keep-alive; server pushes via broadcast()
    except WebSocketDisconnect:
        websocket_manager.disconnect(experiment_id, websocket)
