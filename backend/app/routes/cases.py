from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import Case, Review, Followup, NotificationLog, AuditLog
from app.schemas import (
    CaseCreate, CaseOut, CaseDetailOut, 
    CaseReviewCreate, CaseAssignCreate, 
    CaseResolveCreate, CaseNotifyCreate
)
from app.services.triage_engine import evaluate_triage

router = APIRouter(prefix="/api/cases", tags=["Cases"])

def generate_next_case_id(db: Session) -> str:
    # Find highest current case id number
    all_cases = db.query(Case.case_id).all()
    max_num = 0
    for (cid,) in all_cases:
        if cid.startswith("P") and cid[1:].isdigit():
            num = int(cid[1:])
            if num > max_num:
                max_num = num
    return f"P{max_num + 1:03d}"

@router.post("", response_model=CaseDetailOut)
@router.post("/", response_model=CaseDetailOut)
def create_case(payload: CaseCreate, db: Session = Depends(get_db)):
    case_id = generate_next_case_id(db)
    
    # Run rule-based triage engine
    triage_result = evaluate_triage(
        message=payload.message,
        waiting_time_minutes=0,
        request_type=payload.request_type
    )

    new_case = Case(
        case_id=case_id,
        request_type=payload.request_type,
        message=payload.message,
        contact_method=payload.contact_method or "Phone",
        waiting_time_minutes=0,
        risk_score=triage_result["risk_score"],
        system_priority=triage_result["priority"],
        risk_indicators=triage_result["risk_indicators"],
        evidence=triage_result["evidence"],
        status="Pending Review",
        assigned_to=None,
        created_at=datetime.utcnow()
    )

    db.add(new_case)

    # Add initial audit log
    audit = AuditLog(
        case_id=case_id,
        action="CASE_INTAKE",
        performed_by="System Triage Engine",
        details=f"Intake registered with calculated risk score {triage_result['risk_score']} ({triage_result['priority']} priority)",
        timestamp=datetime.utcnow()
    )
    db.add(audit)

    db.commit()
    db.refresh(new_case)
    return new_case

@router.get("", response_model=List[CaseOut])
@router.get("/", response_model=List[CaseOut])
def list_cases(
    priority: Optional[str] = Query(None, description="Filter by system or final priority (LOW, MEDIUM, HIGH)"),
    status: Optional[str] = Query(None, description="Filter by status (Pending Review, Reviewed, Assigned, Follow-up Pending, Completed, Resolved)"),
    search: Optional[str] = Query(None, description="Search by case_id, request_type, or message content"),
    db: Session = Depends(get_db)
):
    query = db.query(Case)

    if priority:
        p_upper = priority.upper()
        if p_upper in ["LOW", "MEDIUM", "HIGH"]:
            query = query.filter(Case.system_priority == p_upper)
            
    if status:
        if status == "Pending Review":
            query = query.filter(Case.status == "Pending Review")
        elif status == "Assigned":
            query = query.filter(Case.assigned_to.isnot(None))
        elif status in ["Completed", "Resolved"]:
            query = query.filter(Case.status.in_(["Completed", "Resolved"]))
        else:
            query = query.filter(Case.status == status)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Case.case_id.ilike(search_pattern)) |
            (Case.request_type.ilike(search_pattern)) |
            (Case.message.ilike(search_pattern)) |
            (Case.assigned_to.ilike(search_pattern))
        )

    # Order by ID descending so newest cases appear at the top
    cases = query.order_by(Case.id.desc()).all()
    return cases

@router.get("/{case_id}", response_model=CaseDetailOut)
def get_case_detail(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@router.post("/{case_id}/review", response_model=CaseDetailOut)
def submit_human_review(case_id: str, payload: CaseReviewCreate, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    review = Review(
        case_id=case.case_id,
        system_priority=case.system_priority,
        final_priority=payload.final_priority,
        reviewer=payload.reviewer or "Staff Reviewer",
        reviewer_note=payload.reviewer_note or "",
        reviewed_at=datetime.utcnow()
    )

    db.add(review)

    # Update case status and update system_priority if overriden to reflect current priority state
    case.status = "Reviewed"
    case.system_priority = payload.final_priority

    # Audit log
    audit = AuditLog(
        case_id=case.case_id,
        action="PRIORITY_REVIEWED",
        performed_by=payload.reviewer or "Staff Reviewer",
        details=f"Human review set priority to {payload.final_priority}. Note: {payload.reviewer_note or 'No additional note'}",
        timestamp=datetime.utcnow()
    )
    db.add(audit)
    
    db.commit()
    db.refresh(case)
    return case

@router.post("/{case_id}/assign", response_model=CaseDetailOut)
def assign_case_staff(case_id: str, payload: CaseAssignCreate, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    case.assigned_to = payload.assigned_to
    case.status = "Follow-up Pending"

    followup = Followup(
        case_id=case.case_id,
        assigned_to=payload.assigned_to,
        due_time=payload.due_time,
        status="Follow-up Pending",
        notes=payload.notes or "",
        created_at=datetime.utcnow()
    )

    db.add(followup)

    # Audit log
    audit = AuditLog(
        case_id=case.case_id,
        action="STAFF_ASSIGNED",
        performed_by="Clinical Coordinator",
        details=f"Assigned to {payload.assigned_to} with target due time: {payload.due_time}. Notes: {payload.notes or 'None'}",
        timestamp=datetime.utcnow()
    )
    db.add(audit)

    db.commit()
    db.refresh(case)
    return case

@router.post("/{case_id}/resolve", response_model=CaseDetailOut)
def resolve_case(case_id: str, payload: CaseResolveCreate, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    case.status = "Resolved"
    case.resolution_disposition = payload.disposition
    case.resolution_notes = payload.notes
    case.resolved_by = payload.resolved_by or "Staff Clinician"
    case.resolved_at = datetime.utcnow()

    # Mark active followups as completed
    for f in case.followups:
        if f.status != "Completed":
            f.status = "Completed"
            f.completed_at = datetime.utcnow()

    # Audit log
    audit = AuditLog(
        case_id=case.case_id,
        action="CASE_RESOLVED",
        performed_by=payload.resolved_by or "Staff Clinician",
        details=f"Case closed with disposition: '{payload.disposition}'. Notes: {payload.notes or 'None'}",
        timestamp=datetime.utcnow()
    )
    db.add(audit)

    db.commit()
    db.refresh(case)
    return case

@router.post("/{case_id}/notify", response_model=CaseDetailOut)
def send_patient_notification(case_id: str, payload: CaseNotifyCreate, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    notif = NotificationLog(
        case_id=case.case_id,
        channel=payload.channel,
        recipient=payload.recipient,
        template_type=payload.template_type,
        message_body=payload.message_body,
        status="Delivered",
        sent_by=payload.sent_by or "Clinical Dispatch",
        sent_at=datetime.utcnow()
    )
    db.add(notif)

    # Audit log
    audit = AuditLog(
        case_id=case.case_id,
        action="PATIENT_COMMUNICATION",
        performed_by=payload.sent_by or "Clinical Dispatch",
        details=f"Sent {payload.channel} [{payload.template_type}] to {payload.recipient}: \"{payload.message_body[:80]}...\"",
        timestamp=datetime.utcnow()
    )
    db.add(audit)

    db.commit()
    db.refresh(case)
    return case
