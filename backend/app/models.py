from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String(20), unique=True, index=True, nullable=False)
    request_type = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    contact_method = Column(String(50), nullable=True, default="Phone")
    waiting_time_minutes = Column(Integer, default=0)
    risk_score = Column(Integer, nullable=False, default=0)
    system_priority = Column(String(20), nullable=False)  # LOW, MEDIUM, HIGH
    risk_indicators = Column(JSON, nullable=True, default=list)
    evidence = Column(JSON, nullable=True, default=list)
    status = Column(String(50), nullable=False, default="Pending Review")  # Pending Review, Reviewed, Assigned, Follow-up Pending, Completed, Resolved
    assigned_to = Column(String(100), nullable=True)
    
    # Resolution fields
    resolution_disposition = Column(String(100), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    resolved_by = Column(String(100), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    reviews = relationship("Review", back_populates="case", cascade="all, delete-orphan")
    followups = relationship("Followup", back_populates="case", cascade="all, delete-orphan")
    notifications = relationship("NotificationLog", back_populates="case", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="case", cascade="all, delete-orphan")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String(20), ForeignKey("cases.case_id"), nullable=False)
    system_priority = Column(String(20), nullable=False)
    final_priority = Column(String(20), nullable=False)  # LOW, MEDIUM, HIGH
    reviewer = Column(String(100), nullable=False)
    reviewer_note = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("Case", back_populates="reviews")


class Followup(Base):
    __tablename__ = "followups"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String(20), ForeignKey("cases.case_id"), nullable=False)
    assigned_to = Column(String(100), nullable=False)
    due_time = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default="Follow-up Pending")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    case = relationship("Case", back_populates="followups")


class NotificationLog(Base):
    __tablename__ = "notification_logs"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String(20), ForeignKey("cases.case_id"), nullable=False)
    channel = Column(String(50), nullable=False, default="SMS")  # SMS, Email, In-App
    recipient = Column(String(100), nullable=False)
    template_type = Column(String(100), nullable=False)
    message_body = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="Delivered")  # Delivered, Sent, Failed
    sent_by = Column(String(100), nullable=False, default="Clinical Dispatch")
    sent_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("Case", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String(20), ForeignKey("cases.case_id"), nullable=False)
    action = Column(String(100), nullable=False)
    performed_by = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    case = relationship("Case", back_populates="audit_logs")
