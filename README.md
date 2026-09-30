# Post-Discharge Urgency Triage System (Complete Clinical Edition)

> **Human-reviewed urgency triage platform for counselling, helpline, and follow-up requests following acute psychiatric care discharge.**

---

## 1. Problem Statement

Patients discharged from acute psychiatric care often require outpatient counselling, follow-up, or helpline assistance. Post-discharge support channels frequently receive a mix of routine administrative queries (e.g., appointment confirmations) and potentially urgent requests expressing acute distress or safety concerns. Without systematic triage support, clinical operations teams face challenges rapidly identifying requests that require priority human review.

---

## 2. Project Objective

The objective of this project is to build a field-ready, comprehensive clinical triage platform that assists hospital staff by:
1. Automatically evaluating patient-submitted request text against transparent rule-based risk indicators.
2. Generating a preliminary priority recommendation (`LOW`, `MEDIUM`, or `HIGH`) along with clear evidence.
3. Presenting cases on a professional clinical operations dashboard with real-time audio/visual alerts for high-priority cases.
4. **Strictly enforcing human-in-the-loop oversight**: Requiring human staff to review evidence, confirm or override preliminary priority ratings, and manage staff assignment and follow-up schedules.
5. Providing full case resolution lifecycle, simulated multi-channel patient communications (SMS/Email), comprehensive audit logging, and one-click clinical report export (CSV & Print/PDF).

---

## 3. How the System Works

```mermaid
flowchart TD
    A[Patient Intake Form /intake] -->|Submit Request| B[FastAPI Backend /api/cases]
    B --> C[Transparent Triage Engine]
    C -->|Detect Risk Keywords & Queue Time| D[Calculate Risk Score & Priority]
    D -->|Persist Case & Audit Entry| E[(SQLite Database)]
    E --> F[Staff Dashboard /dashboard]
    F -->|Real-time Alert Banner & Chime| F
    F -->|Select Case| G[Case Details /cases/:caseId]
    G -->|Present Evidence & Score| H[Human Clinician Review]
    H -->|Confirm or Override Priority| I[Update Status to Reviewed]
    I -->|Assign Staff & Schedule| J[Follow-up Pending Status]
    J -->|Simulate SMS/Email Communication| K[Patient Communication Log]
    K -->|Complete Safety Plan & Close| L[Resolved / Closed Status]
    L -->|Export Dossier| M[CSV & PDF Printable Report]
```

---

## 4. Technology Stack

- **Frontend**:
  - React 18 (JavaScript / JSX)
  - Vite
  - Tailwind CSS v4
  - Lucide React icons
  - React Router v6
  - Recharts
  - Web Audio API (Synthesized clinical alert chimes)
- **Backend**:
  - Python 3.10+
  - FastAPI
  - SQLAlchemy ORM
  - Pydantic v2
  - Uvicorn
- **Database**:
  - SQLite (`hospital_triage.db`)
- **Testing**:
  - Pytest & FastAPI TestClient / HTTPX

---

## 5. Repository Folder Structure

```
hospital-triage-mvp/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── PriorityBadge.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── PriorityChart.jsx
│   │   │   └── DisclaimerBanner.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── PatientIntakePage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   └── CaseDetailsPage.jsx
│   │   ├── utils/
│   │   │   └── audioAlert.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── routes/
│   │   │   ├── cases.py
│   │   │   └── dashboard.py
│   │   └── services/
│   │       └── triage_engine.py
│   ├── tests/
│   │   ├── test_triage_engine.py
│   │   └── test_api.py
│   ├── seed.py
│   └── requirements.txt
│
├── README.md
├── .gitignore
└── docker-compose.yml
```

---

## 6. Transparent Triage Rules

The Python triage engine (`backend/app/services/triage_engine.py`) uses a transparent keyword scoring system:

| Risk Category | Score Weight | Trigger Phrase Examples |
| :--- | :---: | :--- |
| **Safety Concern** | **+5** | `"unsafe"`, `"not safe"`, `"don't feel safe"`, `"danger"`, `"can't keep myself safe"`, `"harm"`, `"end it"` |
| **Severe Distress** | **+3** | `"extremely distressed"`, `"very distressed"`, `"overwhelmed"`, `"can't cope"`, `"desperate"`, `"breaking down"` |
| **Urgency Language** | **+2** | `"immediately"`, `"right now"`, `"urgent"`, `"asap"` |
| **Support Isolation** | **+2** | `"alone"`, `"no one to help"`, `"nobody"`, `"isolated"` |
| **Queue Operational Boost** | **+1** | `waiting_time_minutes > 30` |

### Prototype Priority Thresholds:
- **0 – 2**: `LOW` Priority (Green)
- **3 – 5**: `MEDIUM` Priority (Amber)
- **6+**: `HIGH` Priority (Red)

> *Note: These rule thresholds are prototype thresholds designed for synthetic demonstration and are NOT medically validated clinical thresholds.*

---

## 7. Human-in-the-Loop & End-to-End Workflow

**Critical Requirement**: Automated system recommendations NEVER automatically finalize clinical decisions or actions.

- **System Recommendation**: Prominently displays: `"Prototype recommendation — human review required"`.
- **Human Controls**:
  - Staff click `Confirm Priority` to accept system priority OR `Override Priority` to select `LOW`, `MEDIUM`, or `HIGH`.
  - Staff enter their name and clinical rationale notes.
  - The database records both `system_priority` and `final_priority` alongside timestamped reviewer metadata.
- **Assignment**: Staff assign cases to `Staff A (Psychiatric Nurse)`, `Staff B (Clinical Social Worker)`, `Staff C (Outpatient Counsellor)`, or `Crisis Response Team` with target callback times.
- **Patient Communication Simulator**: Send simulated SMS / Email / In-App notifications with delivery receipts (Safety Check-ins, Clinician Assigned, 988 Crisis Resources).
- **Case Resolution & Closure**: Record clinical disposition (`Safety Plan Formed`, `Follow-up Call Completed`, etc.), closing summary notes, and transition case to `Resolved`.
- **Audit Logging**: Full chronological compliance timeline tracking all events.
- **Export & Reporting**: Instant CSV export and print-ready clinical report formatting.

---

## 8. Synthetic Data

All pre-populated records (`P001` through `P018`) generated by `backend/seed.py` are strictly **synthetic demo data**. No real patient health information (PHI) is stored or processed.

---

## 9. API Endpoints

- `POST /api/cases` — Submit new patient support request.
- `GET /api/cases` — List cases with priority/status filters and search.
- `GET /api/cases/{case_id}` — Get case details, risk indicators, review history, notifications, and audit timeline.
- `POST /api/cases/{case_id}/review` — Submit human review decision (confirm or override priority).
- `POST /api/cases/{case_id}/assign` — Assign staff member and set follow-up due time.
- `POST /api/cases/{case_id}/resolve` — Mark case as resolved with disposition and clinical closing notes.
- `POST /api/cases/{case_id}/notify` — Dispatch simulated SMS/Email notification to patient.
- `GET /api/dashboard/stats` — Fetch KPI counts, average response time, priority & request type distributions.
- `GET /api/dashboard/export/csv` — Stream/download full CSV export of all cases and triage records.

Automatic interactive OpenAPI documentation is available at `http://localhost:8000/docs`.

---

## 10. Installation & Run Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Backend Setup
```bash
cd backend

# Create virtual environment (optional)
python -m venv .venv
# On Windows: .venv\Scripts\activate
# On macOS/Linux: source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed synthetic database (P001 - P018)
python seed.py

# Start FastAPI Uvicorn dev server
uvicorn app.main:app --reload --port 8000
```
Backend will be live at `http://localhost:8000` with Swagger UI at `http://localhost:8000/docs`.

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend will be live at `http://localhost:5173`.

---

## 11. Testing Instructions

Run the pytest suite to verify triage rules, score thresholds, evidence generation, resolution workflows, notification logging, and API endpoints:

```bash
cd backend
python -m pytest
```

Expected output: `8 passed in ~2.00s`.

---

## 12. End-to-End Demonstration Script

Follow this sequence for the demo:

1. Open `http://localhost:5173/intake`.
2. Select **Helpline** request type and submit message:
   `"I am feeling very distressed and I don't feel safe being alone."`
3. Verify patient receives confirmation: *"Your support request has been submitted."* (Clinical scores remain hidden).
4. Open Staff Dashboard (`http://localhost:5173/dashboard`).
5. Observe newly created case with **HIGH** priority badge and **Pending Review** status, along with audio/visual alert banner.
6. Click **Review** to inspect case details (`/cases/P...`).
7. Verify detected risk indicators (**Safety Concern** +5, **Severe Distress** +3, **Support Isolation** +2) and risk score **10**.
8. Verify prominent disclaimer: `"Prototype recommendation — human review required"`.
9. Click **Confirm Priority**, enter reviewer note, and submit review. Status updates to **Reviewed**.
10. Select **Staff A**, set follow-up due time (e.g. `Today, 3:30 PM`), and submit assignment. Status updates to **Follow-up Pending**.
11. In the **Patient Communication Simulator**, select **Safety Check-in** template and click **Send Simulated Communication**. Verify message log and receipt.
12. In the **Case Resolution & Closure** panel, select **Safety Plan Formed & Verified**, enter summary notes, and click **Mark Case as Resolved & Closed**.
13. Click **Print / PDF Clinical Report** to generate a clean clinical summary.
14. Return to dashboard, verify KPI counts and click **Export CSV** to download the complete case ledger.

---

## 13. Ethical & Safety Limitations

> [!CAUTION]
> This repository contains a student prototype using synthetic data and transparent rule-based logic. It is **NOT** a medical diagnostic tool, suicide risk prediction model, or emergency response system. It must **NEVER** be deployed for live clinical decision-making without formal clinical validation and institutional approval.
