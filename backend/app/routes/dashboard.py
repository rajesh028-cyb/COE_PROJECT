from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Case
from app.schemas import DashboardStatsOut

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsOut)
def get_dashboard_stats(db: Session = Depends(get_db)):
    cases = db.query(Case).all()

    total_cases = len(cases)
    high_count = sum(1 for c in cases if c.system_priority == "HIGH")
    medium_count = sum(1 for c in cases if c.system_priority == "MEDIUM")
    low_count = sum(1 for c in cases if c.system_priority == "LOW")

    awaiting_review = sum(1 for c in cases if c.status == "Pending Review")
    followup_pending = sum(1 for c in cases if c.status in ["Follow-up Pending", "Assigned"])

    priority_distribution = [
        {"name": "HIGH", "count": high_count, "color": "#ef4444"},
        {"name": "MEDIUM", "count": medium_count, "color": "#f59e0b"},
        {"name": "LOW", "count": low_count, "color": "#10b981"}
    ]

    return {
        "total_cases": total_cases,
        "high_priority_count": high_count,
        "medium_priority_count": medium_count,
        "low_priority_count": low_count,
        "awaiting_review_count": awaiting_review,
        "followup_pending_count": followup_pending,
        "priority_distribution": priority_distribution
    }
