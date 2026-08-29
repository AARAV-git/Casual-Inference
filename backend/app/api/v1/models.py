"""Model Registry endpoints (Section 7.3) — routes through data_service.py, same as /datasets."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.data_service import DataService

router = APIRouter()


@router.get("")
def list_models(db: Session = Depends(get_db)):
    return DataService(db).list_models()


@router.get("/{model_id}")
def get_model(model_id: str, db: Session = Depends(get_db)):
    model = DataService(db).get_model(model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return model


@router.get("/{model_id}/metrics")
def get_model_metrics(model_id: str, db: Session = Depends(get_db)):
    metrics = DataService(db).get_model_metrics(model_id)
    if metrics is None:
        raise HTTPException(status_code=404, detail="Model not found")
    return metrics
