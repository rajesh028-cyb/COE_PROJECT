from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

class IndicatorDetail(BaseModel):
    name: str
    severity: str  # LOW, MEDIUM, HIGH
    score: int
    evidence: str

class CaseCreate(BaseModel):
    request_type: str = Field(..., description="Counselling, Helpline, Follow-up, Appointment Support")
    message: str
    contact_method: Optional[str] = "Phone"

class CaseReviewCreate(BaseModel):
    final_priority: str = Field(..., description="LOW, MEDIUM, HIGH")
    reviewer: str = Field(default="Staff Reviewer")
    reviewer_note: Optional[str] = ""

class CaseAssignCreate(BaseModel):
    assigned_to: str = Field(..., description="Staff A, Staff B, Staff C, etc.")
    due_time: str = Field(..., description="Target due time e.g., 'Today, 3:30 PM'")
    notes: Optional[str] = ""

class CaseResolveCreate(BaseModel):
    disposition: str = Field(..., description="Resolution category e.g., 'Follow-up Completed', 'Safety Plan Formed', 'Referred to Crisis Team'")
    notes: Optional[str] = Field(default="", description="Clinical closing notes")
    resolved_by: str = Field(default="Staff Clinician", description="Name/Role of staff closing the case")

class CaseNotifyCreate(BaseModel):
    channel: str = Field(default="SMS", description="SMS, Email, or In-App")
    recipient: str = Field(..., description="Phone number or email address")
    template_type: str = Field(..., description="Template title e.g., 'Safety Check-in', 'Appointment Confirmation', 'Crisis Resources'")
    message_body: str = Field(..., description="Content of the communication")
    sent_by: str = Field(default="Clinical Dispatch", description="Staff sender name")

class ReviewOut(BaseModel):
    id: int
    case_id: str
    system_priority: str
    final_priority: str
    reviewer: str
    reviewer_note: Optional[str]
    reviewed_at: datetime

    model_config = {"from_attributes": True}

class FollowupOut(BaseModel):
    id: int
    case_id: str
    assigned_to: str
    due_time: str
    status: str
    notes: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

    model_config = {"from_attributes": True}

class NotificationLogOut(BaseModel):
    id: int
    case_id: str
    channel: str
    recipient: str
    template_type: str
    message_body: str
    status: str
    sent_by: str
    sent_at: datetime

    model_config = {"from_attributes": True}

class AuditLogOut(BaseModel):
    id: int
    case_id: str
    action: str
    performed_by: str
    details: Optional[str]
    timestamp: datetime

    model_config = {"from_attributes": True}

class CaseOut(BaseModel):
    id: int
    case_id: str
    request_type: str
    message: str
    contact_method: Optional[str]
    waiting_time_minutes: int
    risk_score: int
    system_priority: str
    status: str
    assigned_to: Optional[str]
    resolution_disposition: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class CaseDetailOut(CaseOut):
    risk_indicators: List[Any]
    evidence: List[Any]
    reviews: List[ReviewOut] = []
    followups: List[FollowupOut] = []
    notifications: List[NotificationLogOut] = []
    audit_logs: List[AuditLogOut] = []

class DashboardStatsOut(BaseModel):
    total_cases: int
    high_priority_count: int
    medium_priority_count: int
    low_priority_count: int
    awaiting_review_count: int
    followup_pending_count: int
    resolved_count: int
    avg_response_minutes: int
    priority_distribution: List[dict]
    request_type_distribution: List[dict]
