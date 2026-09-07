import requests
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def run_demo_flow():
    print("=" * 60)
    print("DEMO WORKFLOW VERIFICATION SCRIPT")
    print("=" * 60)

    # Step 1: Submit Patient Support Request
    print("\n1. Submitting Patient Request via POST /api/cases...")
    payload = {
        "request_type": "Helpline",
        "message": "I am feeling very distressed and I don't feel safe being alone.",
        "contact_method": "Phone"
    }
    res = requests.post(f"{BASE_URL}/cases", json=payload)
    if res.status_code != 200:
        print(f"FAILED to submit request: {res.status_code} {res.text}")
        sys.exit(1)
    
    new_case = res.json()
    case_id = new_case["case_id"]
    print(f"   [SUCCESS] Case Created: ID = {case_id}")
    print(f"   System Priority = {new_case['system_priority']}")
    print(f"   Risk Score = {new_case['risk_score']}")
    print(f"   Status = {new_case['status']}")

    # Step 2: Fetch Dashboard Stats
    print("\n2. Fetching Dashboard Stats via GET /api/dashboard/stats...")
    stats_res = requests.get(f"{BASE_URL}/dashboard/stats")
    stats = stats_res.json()
    print(f"   Total Cases: {stats['total_cases']}")
    print(f"   High Priority Count: {stats['high_priority_count']}")
    print(f"   Awaiting Review: {stats['awaiting_review_count']}")

    # Step 3: Fetch Case Detail
    print(f"\n3. Fetching Case Detail via GET /api/cases/{case_id}...")
    detail_res = requests.get(f"{BASE_URL}/cases/{case_id}")
    detail = detail_res.json()
    print(f"   Message: \"{detail['message']}\"")
    print(f"   Detected Indicators Count: {len(detail['risk_indicators'])}")
    for ind in detail['risk_indicators']:
        print(f"     - Indicator: {ind['name']} (Score: +{ind['score']}, Severity: {ind['severity']})")
    print(f"   Evidence Items Count: {len(detail['evidence'])}")

    # Step 4: Submit Human Review (Confirm Priority)
    print(f"\n4. Submitting Human Review via POST /api/cases/{case_id}/review...")
    review_payload = {
        "final_priority": "HIGH",
        "reviewer": "Staff Clinician A",
        "reviewer_note": "Confirmed high urgency. Direct telephone contact initiated."
    }
    rev_res = requests.post(f"{BASE_URL}/cases/{case_id}/review", json=review_payload)
    rev_case = rev_res.json()
    print(f"   [SUCCESS] Review Recorded. New Status = {rev_case['status']}")
    print(f"   Final Priority = {rev_case['reviews'][-1]['final_priority']}")

    # Step 5: Assign Staff & Set Follow-Up
    print(f"\n5. Assigning Staff via POST /api/cases/{case_id}/assign...")
    assign_payload = {
        "assigned_to": "Staff A",
        "due_time": "Today, 3:30 PM",
        "notes": "Urgent risk assessment callback scheduled."
    }
    assign_res = requests.post(f"{BASE_URL}/cases/{case_id}/assign", json=assign_payload)
    assigned_case = assign_res.json()
    print(f"   [SUCCESS] Staff Assigned: {assigned_case['assigned_to']}")
    print(f"   New Status = {assigned_case['status']}")
    print(f"   Followup Record: Due Time = {assigned_case['followups'][-1]['due_time']}")

    print("\n" + "=" * 60)
    print("ALL DEMO WORKFLOW STEPS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_demo_flow()
