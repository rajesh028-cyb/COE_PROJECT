from typing import Dict, Any, List

def evaluate_triage(message: str, waiting_time_minutes: int = 0, request_type: str = "Counselling") -> Dict[str, Any]:
    """
    Transparent rule-based triage engine for post-discharge support requests.
    This is a synthetic prototype engine and NOT a medical diagnostic tool.
    """
    text = (message or "").lower()
    score = 0
    indicators: List[Dict[str, Any]] = []
    evidence: List[Dict[str, Any]] = []

    # 1. Safety Concern (+5)
    safety_keywords = [
        "unsafe", "not safe", "don't feel safe", "dont feel safe", "can't feel safe", 
        "danger", "can't keep myself safe", "cant keep myself safe", "harm", "end it"
    ]
    detected_safety = [kw for kw in safety_keywords if kw in text]
    if detected_safety:
        score += 5
        indicators.append({
            "name": "Safety Concern",
            "severity": "HIGH",
            "score": 5
        })
        evidence.append({
            "indicator": "Safety Concern",
            "evidence": f"Detected safety-related phrase(s): '{', '.join(detected_safety)}'",
            "score": 5,
            "severity": "HIGH"
        })

    # 2. Severe Distress (+3)
    distress_keywords = [
        "extremely distressed", "very distressed", "distressed", "overwhelmed", 
        "can't cope", "cant cope", "desperate", "breaking down"
    ]
    detected_distress = [kw for kw in distress_keywords if kw in text]
    if detected_distress:
        score += 3
        indicators.append({
            "name": "Severe Distress",
            "severity": "MEDIUM",
            "score": 3
        })
        evidence.append({
            "indicator": "Severe Distress",
            "evidence": f"Detected distress expression(s): '{', '.join(detected_distress)}'",
            "score": 3,
            "severity": "MEDIUM"
        })

    # 3. Urgency Language (+2)
    urgency_keywords = ["immediately", "right now", "urgent", "asap"]
    detected_urgency = [kw for kw in urgency_keywords if kw in text]
    if detected_urgency:
        score += 2
        indicators.append({
            "name": "Urgency Language",
            "severity": "MEDIUM",
            "score": 2
        })
        evidence.append({
            "indicator": "Urgency Language",
            "evidence": f"Detected urgent timing request: '{', '.join(detected_urgency)}'",
            "score": 2,
            "severity": "MEDIUM"
        })

    # 4. Support Isolation (+2)
    isolation_keywords = ["alone", "no one to help", "nobody", "isolated"]
    detected_isolation = [kw for kw in isolation_keywords if kw in text]
    if detected_isolation:
        score += 2
        indicators.append({
            "name": "Support Isolation",
            "severity": "MEDIUM",
            "score": 2
        })
        evidence.append({
            "indicator": "Support Isolation",
            "evidence": f"Detected isolation indicator: '{', '.join(detected_isolation)}'",
            "score": 2,
            "severity": "MEDIUM"
        })

    # 5. Operational Waiting Time (+1 if > 30 minutes)
    if waiting_time_minutes > 30:
        score += 1
        indicators.append({
            "name": "Operational Queue Time",
            "severity": "LOW",
            "score": 1
        })
        evidence.append({
            "indicator": "Operational Queue Time",
            "evidence": f"Patient waiting time exceeds 30 minutes threshold ({waiting_time_minutes} mins).",
            "score": 1,
            "severity": "LOW"
        })

    # Determine Priority based on synthetic prototype thresholds
    if score >= 6:
        priority = "HIGH"
    elif score >= 3:
        priority = "MEDIUM"
    else:
        priority = "LOW"

    return {
        "risk_score": score,
        "priority": priority,
        "risk_indicators": indicators,
        "evidence": evidence
    }
