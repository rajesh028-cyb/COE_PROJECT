from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import Case, Review, Followup
from app.schemas import CaseCreate, CaseOut, CaseDetailOut, CaseReviewCreate, CaseAssignCreate
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
    db.commit()
    db.refresh(new_case)
    return new_case

@router.get("", response_model=List[CaseOut])
@router.get("/", response_model=List[CaseOut])
def list_cases(
    priority: Optional[str] = Query(None, description="Filter by system or final priority (LOW, MEDIUM, HIGH)"),
    status: Optional[str] = Query(None, description="Filter by status (Pending Review, Reviewed, Assigned, Follow-up Pending, Completed)"),
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
        else:
            query = query.filter(Case.status == status)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Case.case_id.ilike(search_pattern)) |
            (Case.request_type.ilike(search_pattern)) |
            (Case.message.ilike(search_pattern))
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
    db.commit()
    db.refresh(case)
    return case
