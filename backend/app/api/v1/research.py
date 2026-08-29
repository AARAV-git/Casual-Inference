"""
Research section endpoints (Section 7.3) — hypotheses, methodology,
findings for the /research frontend page. Backed by plain markdown files
under research/ (not Postgres), read through data_service.py.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.data_service import DataService

router = APIRouter()


@router.get("/hypotheses")
def get_hypotheses(db: Session = Depends(get_db)):
    return DataService(db).get_research_section("hypotheses")


@router.get("/methodology")
def get_methodology(db: Session = Depends(get_db)):
    return DataService(db).get_research_section("methodology")


@router.get("/experiments")
def get_research_experiments(db: Session = Depends(get_db)):
    return DataService(db).get_research_section("experiments")


@router.get("/findings")
def get_findings(db: Session = Depends(get_db)):
    return DataService(db).get_research_section("literature_review")
