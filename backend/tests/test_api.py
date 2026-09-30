import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models import Case

@pytest.fixture(scope="module")
def test_client():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    client = TestClient(app)
    yield client
    Base.metadata.drop_all(bind=engine)

def test_create_and_get_case(test_client):
    # 1. Create Patient Request via POST /api/cases
    payload = {
        "request_type": "Helpline",
        "message": "I am feeling very distressed and I don't feel safe being alone.",
        "contact_method": "Phone"
    }
    response = test_client.post("/api/cases", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["case_id"] == "P001"
    assert data["system_priority"] == "HIGH"
    assert data["risk_score"] >= 6
    assert data["status"] == "Pending Review"

    # 2. Get case details via GET /api/cases/P001
    get_res = test_client.get("/api/cases/P001")
    assert get_res.status_code == 200
    detail = get_res.json()
    assert detail["case_id"] == "P001"
    assert len(detail["risk_indicators"]) > 0
    assert len(detail["audit_logs"]) >= 1

    # 3. Submit Human Review via POST /api/cases/P001/review
    review_payload = {
        "final_priority": "HIGH",
        "reviewer": "Staff Clinician A",
        "reviewer_note": "Confirmed high urgency. Direct phone call initiated."
    }
    review_res = test_client.post("/api/cases/P001/review", json=review_payload)
    assert review_res.status_code == 200
    reviewed_data = review_res.json()
    assert reviewed_data["status"] == "Reviewed"
    assert len(reviewed_data["reviews"]) == 1

    # 4. Assign Staff via POST /api/cases/P001/assign
    assign_payload = {
        "assigned_to": "Staff A",
        "due_time": "Today, 3:30 PM",
        "notes": "Emergency follow-up required"
    }
    assign_res = test_client.post("/api/cases/P001/assign", json=assign_payload)
    assert assign_res.status_code == 200
    assigned_data = assign_res.json()
    assert assigned_data["assigned_to"] == "Staff A"
    assert assigned_data["status"] == "Follow-up Pending"

    # 5. Send Simulated Patient Notification via POST /api/cases/P001/notify
    notify_payload = {
        "channel": "SMS",
        "recipient": "+1 (555) 345-6789",
        "template_type": "Safety Check-in",
        "message_body": "Hospital Crisis Support: We have received your urgent request and a clinician is calling you now.",
        "sent_by": "Staff Clinician A"
    }
    notify_res = test_client.post("/api/cases/P001/notify", json=notify_payload)
    assert notify_res.status_code == 200
    notified_data = notify_res.json()
    assert len(notified_data["notifications"]) == 1
    assert notified_data["notifications"][0]["template_type"] == "Safety Check-in"

    # 6. Resolve Case via POST /api/cases/P001/resolve
    resolve_payload = {
        "disposition": "Safety Plan Formed",
        "notes": "Direct telephone assessment completed; verified safety with family member present.",
        "resolved_by": "Staff Clinician A"
    }
    resolve_res = test_client.post("/api/cases/P001/resolve", json=resolve_payload)
    assert resolve_res.status_code == 200
    resolved_data = resolve_res.json()
    assert resolved_data["status"] == "Resolved"
    assert resolved_data["resolution_disposition"] == "Safety Plan Formed"

def test_dashboard_stats_and_csv_export(test_client):
    # Dashboard stats
    res = test_client.get("/api/dashboard/stats")
    assert res.status_code == 200
    stats = res.json()
    assert stats["total_cases"] >= 1
    assert "high_priority_count" in stats
    assert "priority_distribution" in stats
    assert "resolved_count" in stats
    assert "request_type_distribution" in stats

    # CSV Export
    csv_res = test_client.get("/api/dashboard/export/csv")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "Case ID" in csv_res.text
    assert "P001" in csv_res.text
