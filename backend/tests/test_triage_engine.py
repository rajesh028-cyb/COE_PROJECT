import pytest
from app.services.triage_engine import evaluate_triage

def test_routine_request_low_priority():
    result = evaluate_triage(
        message="I would like to confirm the date and time of my next outpatient appointment.",
        waiting_time_minutes=10,
        request_type="Follow-up"
    )
    assert result["priority"] == "LOW"
    assert result["risk_score"] <= 2
    assert isinstance(result["risk_indicators"], list)

def test_distress_request_medium_priority():
    result = evaluate_triage(
        message="I've been feeling overwhelmed since coming home.",
        waiting_time_minutes=15,
        request_type="Counselling"
    )
    assert result["priority"] == "MEDIUM"
    assert result["risk_score"] >= 3
    assert any(ind["name"] == "Severe Distress" for ind in result["risk_indicators"])

def test_safety_request_high_priority():
    result = evaluate_triage(
        message="I am feeling very distressed and I don't feel safe being alone.",
        waiting_time_minutes=10,
        request_type="Helpline"
    )
    assert result["priority"] == "HIGH"
    assert result["risk_score"] >= 6
    assert any(ind["name"] == "Safety Concern" for ind in result["risk_indicators"])
    assert len(result["evidence"]) > 0

def test_multiple_indicators_score_accumulation():
    # Safety (+5) + Distress (+3) + Urgency (+2) + Isolation (+2) = 12
    result = evaluate_triage(
        message="I feel unsafe, extremely distressed, urgent help needed, I am alone right now.",
        waiting_time_minutes=0,
        request_type="Helpline"
    )
    assert result["risk_score"] >= 10
    assert result["priority"] == "HIGH"
    indicator_names = [ind["name"] for ind in result["risk_indicators"]]
    assert "Safety Concern" in indicator_names
    assert "Severe Distress" in indicator_names
    assert "Urgency Language" in indicator_names
    assert "Support Isolation" in indicator_names

def test_waiting_time_boost():
    # Routine message (0 pts) + waiting 35 mins (+1 pt) = 1 pt -> LOW
    result_over_30 = evaluate_triage(
        message="Reschedule my appointment please.",
        waiting_time_minutes=35,
        request_type="Appointment Support"
    )
    assert any(ind["name"] == "Operational Queue Time" for ind in result_over_30["risk_indicators"])

def test_evidence_structure_returned():
    result = evaluate_triage(
        message="I can't keep myself safe",
        waiting_time_minutes=5,
        request_type="Helpline"
    )
    assert len(result["evidence"]) >= 1
    evidence_item = result["evidence"][0]
    assert "indicator" in evidence_item
    assert "evidence" in evidence_item
    assert "score" in evidence_item
