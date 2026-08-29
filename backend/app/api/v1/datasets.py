"""Dataset Explorer endpoints (Section 7.3)."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.data_service import DataService

router = APIRouter()


@router.get("")
def list_datasets(db: Session = Depends(get_db)):
    return DataService(db).list_datasets()


@router.get("/{dataset_id}")
def get_dataset(dataset_id: str, db: Session = Depends(get_db)):
    dataset = DataService(db).get_dataset(dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset


@router.get("/{dataset_id}/statistics")
def get_dataset_statistics(dataset_id: str, db: Session = Depends(get_db)):
    """Schema, feature distributions, missing values, treatment/outcome distributions."""
    raise NotImplementedError("Compute summary statistics from data/processed/<dataset_id>.parquet")
