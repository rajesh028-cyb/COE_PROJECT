import csv
import io
from fastapi import APIRouter, Depends
from fastapi.responses import Response
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
    resolved_count = sum(1 for c in cases if c.status in ["Completed", "Resolved"])

    # Calculate average waiting time
    total_waiting = sum(c.waiting_time_minutes for c in cases)
    avg_response_minutes = round(total_waiting / total_cases) if total_cases > 0 else 0

    priority_distribution = [
        {"name": "HIGH", "count": high_count, "color": "#ef4444"},
        {"name": "MEDIUM", "count": medium_count, "color": "#f59e0b"},
        {"name": "LOW", "count": low_count, "color": "#10b981"}
    ]

    # Request type distribution
    req_counts = {}
    for c in cases:
        rt = c.request_type or "General"
        req_counts[rt] = req_counts.get(rt, 0) + 1

    colors = ["#0284c7", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899"]
    request_type_distribution = [
        {"name": k, "count": v, "color": colors[i % len(colors)]}
        for i, (k, v) in enumerate(req_counts.items())
    ]

    return {
        "total_cases": total_cases,
        "high_priority_count": high_count,
        "medium_priority_count": medium_count,
        "low_priority_count": low_count,
        "awaiting_review_count": awaiting_review,
        "followup_pending_count": followup_pending,
        "resolved_count": resolved_count,
        "avg_response_minutes": avg_response_minutes,
        "priority_distribution": priority_distribution,
        "request_type_distribution": request_type_distribution
    }

@router.get("/export/csv")
def export_cases_csv(db: Session = Depends(get_db)):
    cases = db.query(Case).order_by(Case.id.asc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write CSV Header
    writer.writerow([
        "Case ID", "Request Type", "Contact Method", "Waiting (min)", 
        "Risk Score", "Priority", "Status", "Assigned To", 
        "Resolution Disposition", "Resolved By", "Resolved At", "Created At", "Message"
    ])
    
    for c in cases:
        writer.writerow([
            c.case_id,
            c.request_type,
            c.contact_method or "Phone",
            c.waiting_time_minutes,
            c.risk_score,
            c.system_priority,
            c.status,
            c.assigned_to or "Unassigned",
            c.resolution_disposition or "N/A",
            c.resolved_by or "N/A",
            c.resolved_at.strftime("%Y-%m-%d %H:%M:%S") if c.resolved_at else "N/A",
            c.created_at.strftime("%Y-%m-%d %H:%M:%S") if c.created_at else "N/A",
            c.message.replace("\n", " ")
        ])
    
    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=hospital_triage_cases_export.csv"}
    )
