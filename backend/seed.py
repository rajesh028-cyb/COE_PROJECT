import os
import sys
from datetime import datetime, timedelta

# Ensure backend root is on sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import Case, Review, Followup
from app.services.triage_engine import evaluate_triage

def seed_database():
    print("Initializing Database Schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # 18 Realistic Synthetic Cases (P001 to P018)
    synthetic_cases_data = [
        # HIGH PRIORITY CASES
        {
            "case_id": "P001",
            "request_type": "Helpline",
            "message": "I am feeling extremely distressed and I don't feel safe being alone right now.",
            "contact_method": "Phone",
            "waiting_time_minutes": 15,
            "status": "Pending Review",
            "assigned_to": None,
            "hours_ago": 1
        },
        {
            "case_id": "P002",
            "request_type": "Counselling",
            "message": "I feel completely overwhelmed and I can't keep myself safe. Please reach out immediately.",
            "contact_method": "Phone",
            "waiting_time_minutes": 45,
            "status": "Pending Review",
            "assigned_to": None,
            "hours_ago": 2
        },
        {
            "case_id": "P003",
            "request_type": "Helpline",
            "message": "I'm in danger of hurting myself. Nobody is here with me and I need urgent help right now.",
            "contact_method": "Phone",
            "waiting_time_minutes": 8,
            "status": "Pending Review",
            "assigned_to": None,
            "hours_ago": 0.5
        },
        {
            "case_id": "P004",
            "request_type": "Counselling",
            "message": "I've been feeling hopeless since discharge and I am scared I am going to end it.",
            "contact_method": "Portal",
            "waiting_time_minutes": 25,
            "status": "Reviewed",
            "reviewer": "Staff A",
            "reviewer_note": "Confirmed high urgency based on safety keywords. Reaching out immediately.",
            "assigned_to": "Staff A",
            "hours_ago": 4
        },
        {
            "case_id": "P005",
            "request_type": "Helpline",
            "message": "It's an emergency, I'm feeling unsafe and breaking down.",
            "contact_method": "Phone",
            "waiting_time_minutes": 60,
            "status": "Follow-up Pending",
            "reviewer": "Staff B",
            "reviewer_note": "Priority confirmed. Direct telephone contact initiated.",
            "assigned_to": "Staff B",
            "due_time": "Today, 4:00 PM",
            "hours_ago": 5
        },

        # MEDIUM PRIORITY CASES
        {
            "case_id": "P006",
            "request_type": "Counselling",
            "message": "I've been feeling overwhelmed since coming home. I can't cope with the daily medication changes.",
            "contact_method": "Email",
            "waiting_time_minutes": 35,
            "status": "Pending Review",
            "assigned_to": None,
            "hours_ago": 3
        },
        {
            "case_id": "P007",
            "request_type": "Follow-up",
            "message": "I am feeling alone and desperately need someone to talk to about my transition care plan.",
            "contact_method": "Phone",
            "waiting_time_minutes": 20,
            "status": "Pending Review",
            "assigned_to": None,
            "hours_ago": 2.5
        },
        {
            "case_id": "P008",
            "request_type": "Counselling",
            "message": "My anxiety is spiking right now and I am having trouble sleeping. Please call me asap.",
            "contact_method": "Phone",
            "waiting_time_minutes": 12,
            "status": "Reviewed",
            "reviewer": "Staff C",
            "reviewer_note": "Reviewed. Medium priority verified. Scheduled callback.",
            "assigned_to": "Staff C",
            "hours_ago": 6
        },
        {
            "case_id": "P009",
            "request_type": "Helpline",
            "message": "I feel isolated and nobody is answering my calls. I need support asap.",
            "contact_method": "Phone",
            "waiting_time_minutes": 40,
            "status": "Follow-up Pending",
            "reviewer": "Staff A",
            "reviewer_note": "Reviewed and assigned callback task.",
            "assigned_to": "Staff A",
            "due_time": "Today, 5:15 PM",
            "hours_ago": 7
        },
        {
            "case_id": "P010",
            "request_type": "Appointment Support",
            "message": "I am desperate to reschedule my psychiatric follow-up appointment because I ran out of meds.",
            "contact_method": "Portal",
            "waiting_time_minutes": 50,
            "status": "Pending Review",
            "assigned_to": None,
            "hours_ago": 1.5
        },

        # LOW PRIORITY CASES
        {
            "case_id": "P011",
            "request_type": "Follow-up",
            "message": "I would like to confirm the date and time of my next outpatient appointment.",
            "contact_method": "Email",
            "waiting_time_minutes": 10,
            "status": "Pending Review",
            "assigned_to": None,
            "hours_ago": 8
        },
        {
            "case_id": "P012",
            "request_type": "Appointment Support",
            "message": "Please send a copy of my discharge summary to my primary care doctor.",
            "contact_method": "Portal",
            "waiting_time_minutes": 18,
            "status": "Reviewed",
            "reviewer": "Staff B",
            "reviewer_note": "Routine request. Standard administrative workflow.",
            "assigned_to": "Staff B",
            "hours_ago": 12
        },
        {
            "case_id": "P013",
            "request_type": "Counselling",
            "message": "Just checking in to say my community support group meeting went well today.",
            "contact_method": "Email",
            "waiting_time_minutes": 5,
            "status": "Completed",
            "reviewer": "Staff C",
            "reviewer_note": "Positive check-in. Archived.",
            "assigned_to": "Staff C",
            "hours_ago": 24
        },
        {
            "case_id": "P014",
            "request_type": "Follow-up",
            "message": "Can someone remind me what time the peer support session starts tomorrow?",
            "contact_method": "Phone",
            "waiting_time_minutes": 15,
            "status": "Pending Review",
            "assigned_to": None,
            "hours_ago": 4.5
        },
        {
            "case_id": "P015",
            "request_type": "Appointment Support",
            "message": "I need to update my home mailing address in the hospital system.",
            "contact_method": "Portal",
            "waiting_time_minutes": 22,
            "status": "Completed",
            "reviewer": "Staff A",
            "reviewer_note": "Address updated in portal.",
            "assigned_to": "Staff A",
            "hours_ago": 30
        },

        # LONG WAITING & AMBIGUOUS CASES
        {
            "case_id": "P016",
            "request_type": "Counselling",
            "message": "I haven't heard back regarding my counsellor assignment. It's been a few days and I am alone.",
            "contact_method": "Email",
            "waiting_time_minutes": 75,
            "status": "Pending Review",
            "assigned_to": None,
            "hours_ago": 3.5
        },
        {
            "case_id": "P017",
            "request_type": "Helpline",
            "message": "Things are tough. Not sure if I can cope with this stress right now.",
            "contact_method": "Phone",
            "waiting_time_minutes": 28,
            "status": "Pending Review",
            "assigned_to": None,
            "hours_ago": 2
        },
        {
            "case_id": "P018",
            "request_type": "Follow-up",
            "message": "Requesting a brief call from the discharge coordinator when available.",
            "contact_method": "Phone",
            "waiting_time_minutes": 14,
            "status": "Pending Review",
            "assigned_to": None,
            "hours_ago": 1
        }
    ]

    print("Seeding 18 synthetic cases...")
    now = datetime.utcnow()

    for item in synthetic_cases_data:
        # Calculate triage score & priority
        triage = evaluate_triage(
            message=item["message"],
            waiting_time_minutes=item["waiting_time_minutes"],
            request_type=item["request_type"]
        )

        created_time = now - timedelta(hours=item.get("hours_ago", 1))

        case_obj = Case(
            case_id=item["case_id"],
            request_type=item["request_type"],
            message=item["message"],
            contact_method=item["contact_method"],
            waiting_time_minutes=item["waiting_time_minutes"],
            risk_score=triage["risk_score"],
            system_priority=triage["priority"],
            risk_indicators=triage["risk_indicators"],
            evidence=triage["evidence"],
            status=item["status"],
            assigned_to=item.get("assigned_to"),
            created_at=created_time
        )
        db.add(case_obj)

        # Seed review if status is beyond pending
        if "reviewer" in item:
            review_obj = Review(
                case_id=item["case_id"],
                system_priority=triage["priority"],
                final_priority=triage["priority"],
                reviewer=item["reviewer"],
                reviewer_note=item.get("reviewer_note", "Human review confirmed system triage recommendation."),
                reviewed_at=created_time + timedelta(minutes=15)
            )
            db.add(review_obj)

        # Seed followup if status is Follow-up Pending
        if item.get("due_time"):
            followup_obj = Followup(
                case_id=item["case_id"],
                assigned_to=item["assigned_to"],
                due_time=item["due_time"],
                status="Follow-up Pending",
                notes="Assigned via staff dashboard.",
                created_at=created_time + timedelta(minutes=20)
            )
            db.add(followup_obj)

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
