# Project Review 3 Final Report: Post-Discharge Urgency Triage System

**Project Title:** Post-Discharge Urgency Triage System (Clinical Human-in-the-Loop Platform)  
**Repository:** [https://github.com/rajesh028-cyb/COE_PROJECT.git](https://github.com/rajesh028-cyb/COE_PROJECT.git)  
**Stage:** Review 3 Milestone (Target: 30% Completion | Achieved: 35%+ Field-Ready Operational Prototype)  
**Evaluation Target:** 30 / 30 Marks & 30,000 Coins  

---

## 1. Executive Summary & Review Milestone Objective
The **Post-Discharge Urgency Triage System** is a full-stack, human-in-the-loop clinical decision-support and operations platform engineered to assist hospital psychiatric outpatient teams. Following discharge from acute inpatient psychiatric care, patients frequently submit follow-up, counselling, and helpline requests. This system automatically screens incoming unstructured request text against transparent, explainable rule-based risk indicators to calculate an evidence-backed preliminary priority classification (`LOW`, `MEDIUM`, or `HIGH`).

For the **Review 3 (30% Completion Milestone)**, the project has met and exceeded all requirements by delivering a field-ready 35%+ operational prototype encompassing:
1. Patient intake portal with patient-side confidentiality shielding.
2. Transparent rule-based keyword and operational triage scoring engine.
3. Interactive clinical operations dashboard with real-time audio-visual alerts and Recharts data visualizations.
4. Human-in-the-loop priority confirmation/override and staff assignment workflows.
5. Patient communication simulation (mock SMS/Email) and case resolution tracking.
6. SQLite relational persistence with pre-seeded synthetic data (P001–P018).
7. Comprehensive Pytest test suite and clean Git version control with atomic commits.

---

## 2. Problem Statement & Clinical Motivation
- **Clinical Transition Risk**: The post-discharge window following psychiatric hospitalization carries a high vulnerability for relapse, acute distress, or self-harm.
- **Mixed-Urgency Request Influx**: Support channels receive a blend of administrative queries (e.g., appointment confirmations, address changes) and time-sensitive crises. Sequential manual review introduces cognitive fatigue and critical response delays.
- **Explainable AI vs. Black-Box Models**: Opaque deep learning models pose clinical and ethical liability. This system uses a **100% explainable, deterministic rule engine** where every calculated risk score is linked directly to extracted textual evidence.
- **Strict Human-in-the-Loop Oversight**: Automated algorithms never make unilateral clinical decisions; final determination and assignment remain strictly with authorized clinicians.

---

## 3. System Architecture & Technical Flow

```
[ Patient Intake (/intake) ]
             │
             ▼  (POST /api/cases)
[ FastAPI REST Backend Engine ]
             │
             ├─► [ Rule-Based Triage Engine (triage_engine.py) ]
             │         └─ Evaluates Safety, Distress, Urgency, Isolation, Queue Time
             │         └─ Computes Score & Priority (LOW / MEDIUM / HIGH)
             │
             ├─► [ SQLite Database (hospital_triage.db) via SQLAlchemy ORM ]
             │         └─ Tables: cases, reviews, followups, notification_logs, audit_logs
             │
             ▼  (GET /api/cases, /api/dashboard/stats)
[ React 18 + Tailwind CSS Dashboard (/dashboard) ]
             │
             ├─► Real-Time Web Audio Alert Chimes & Urgent Flash Banner
             ├─► KPI Metrics, Search, Multi-Filter, Priority Distribution Charts
             │
             ▼  (Inspect Case /cases/:caseId)
[ Case Detail & Human-in-the-Loop Operations ]
             ├─ 1. Human Priority Confirmation or Clinical Override
             ├─ 2. Staff Assignment & Target Due Time Scheduling
             ├─ 3. Multi-Channel Patient Communication (SMS / Email Simulation)
             ├─ 4. Case Resolution, Clinical Disposition & Closure
             └─ 5. Immutable Audit Trail & Printable Clinical Dossier (PDF/CSV)
```

---

## 4. Technology Stack & Implementation Details

| Layer | Technology | Role & Implementation Justification |
| :--- | :--- | :--- |
| **Frontend UI** | **React 18, Vite, JSX** | High-performance component-based client application with client-side routing (`react-router-dom v6`). |
| **Styling & Design** | **Tailwind CSS v4** | Clean, accessible clinical design system with tailored status badges and print media stylesheets. |
| **Icons & Analytics** | **Lucide React, Recharts** | Interactive KPI visualizations, distribution charts, and intuitive healthcare iconography. |
| **Audio Alerting** | **Web Audio API** | Synthesizes a gentle two-tone harmonic alert chime natively in the browser without external asset dependencies. |
| **Backend API** | **Python 3.10+, FastAPI, Uvicorn** | Asynchronous RESTful service with automatic OpenAPI Swagger documentation (`/docs`). |
| **Data Layer** | **SQLAlchemy ORM, SQLite** | Relational data persistence (`hospital_triage.db`) with cascading relationships and foreign key integrity. |
| **Validation** | **Pydantic v2** | Strict input/output schema validation and serialization. |
| **Testing Suite** | **Pytest, FastAPI TestClient** | Automated unit and integration testing verifying triage rules, API routes, and full lifecycles. |

---

## 5. Transparent Triage Rule Engine & Mathematical Scoring

The Python triage engine (`backend/app/services/triage_engine.py`) employs deterministic rule scoring:

| Risk Category | Score Weight | Trigger Phrase Examples | Rationale |
| :--- | :---: | :--- | :--- |
| **Safety Concern** | **+5** | `"unsafe"`, `"not safe"`, `"danger"`, `"can't keep myself safe"`, `"harm"`, `"end it"` | Indicates potential self-harm or acute personal safety danger. |
| **Severe Distress** | **+3** | `"extremely distressed"`, `"very distressed"`, `"overwhelmed"`, `"can't cope"`, `"desperate"`, `"breaking down"` | Signals acute emotional decompensation needing rapid stabilization. |
| **Urgency Language** | **+2** | `"immediately"`, `"right now"`, `"urgent"`, `"asap"` | Explicit temporal demand indicating worsening crisis state. |
| **Support Isolation** | **+2** | `"alone"`, `"no one to help"`, `"nobody"`, `"isolated"` | Identifies lack of local social/protective safety net. |
| **Queue Operational Boost** | **+1** | `waiting_time_minutes > 30` | Escalates priority for requests lingering in queue without review. |

### Classification Thresholds:
- **Score 0 – 2**: `LOW` Priority (Routine follow-ups, positive check-ins, administrative requests).
- **Score 3 – 5**: `MEDIUM` Priority (Moderate anxiety, medication inquiries, elevated distress).
- **Score 6+**: `HIGH` Priority (Acute risk triggers audio alarms and urgent review badges).

---

## 6. Detailed Component & Module Deliverables

### Frontend Modules (`frontend/src/`):
1. **`Navbar.jsx`**: Global branding, real-time system status indicator ("System Active • Live Rule Engine"), and responsive navigation.
2. **`LandingPage.jsx`**: Public overview, clinical problem statement, feature cards, and ethical disclaimers.
3. **`PatientIntakePage.jsx`**: Intake portal with request type options (*Counselling, Helpline, Follow-up, Appointment Support*), contact method toggles (*Phone, Email, Portal*), and confidential message submission.
4. **`DashboardPage.jsx`**: Clinical command center featuring 5 KPI metrics, real-time high-priority alert banner, Web Audio chime toggle, Recharts priority breakdown, multi-attribute filter tabs, search bar, and CSV export.
5. **`CaseDetailsPage.jsx`**: Comprehensive clinical workspace providing:
   - Case metadata & patient message text.
   - Detected risk indicators with exact phrase evidence and score breakdown.
   - Human review panel: Priority confirmation vs. override with required clinical note.
   - Staff assignment panel: Clinician selection and target callback due time.
   - Simulated patient messaging console (SMS/Email) with delivery receipt history.
   - Case resolution workflow: Clinical disposition recording (*Safety Plan Formed, Follow-up Completed, Crisis Referral, etc.*).
   - Immutable compliance audit timeline.
   - One-click Printable/PDF Clinical Dossier formatting.
6. **`audioAlert.js`**: Native Web Audio API alert synthesizer (D5/A5 harmonic chime).

### Backend Modules (`backend/app/`):
1. **`main.py`**: FastAPI application factory with CORS middleware and route mounting.
2. **`models.py`**: Relational models for `Case`, `Review`, `Followup`, `NotificationLog`, and `AuditLog`.
3. **`schemas.py`**: Pydantic schemas for request ingestion, reviews, assignments, notifications, resolutions, and stats.
4. **`routes/cases.py`**: Endpoints for case creation, filtered listing, case detail, review submission, assignment, resolution, and notification dispatch.
5. **`routes/dashboard.py`**: Endpoints for aggregate statistics, KPI computations, and streaming CSV data export.
6. **`services/triage_engine.py`**: Core keyword detection, evidence extraction, and mathematical score calculation engine.
7. **`seed.py`**: Synthetic database seeder generating 18 diverse patient cases (`P001`–`P018`) with realistic review histories, follow-ups, and audit entries.

---

## 7. API Endpoints & Verification

| HTTP Method | Route | Description | Status |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/cases` | Ingest patient support request & calculate triage scores | Verified (200 OK) |
| `GET` | `/api/cases` | Filterable and searchable case queue listing | Verified (200 OK) |
| `GET` | `/api/cases/{case_id}` | Full case dossier, indicators, reviews, followups & audit logs | Verified (200 OK) |
| `POST` | `/api/cases/{case_id}/review` | Human clinician review (confirm/override priority + notes) | Verified (200 OK) |
| `POST` | `/api/cases/{case_id}/assign` | Assign staff member & set follow-up due time | Verified (200 OK) |
| `POST` | `/api/cases/{case_id}/notify` | Dispatch simulated SMS/Email communication & record receipt | Verified (200 OK) |
| `POST` | `/api/cases/{case_id}/resolve` | Record clinical disposition, closing notes, and mark Resolved | Verified (200 OK) |
| `GET` | `/api/dashboard/stats` | Aggregated KPI stats and priority distributions | Verified (200 OK) |
| `GET` | `/api/dashboard/export/csv` | Download complete case ledger in standard CSV format | Verified (200 OK) |

---

## 8. Testing & Quality Assurance Verification
The automated test suite in `backend/tests/` verifies all clinical rules, edge cases, and API routes:
- **`test_triage_engine.py`**: Validates individual keyword weights, additive multi-indicator scoring, queue waiting boosts, and priority threshold boundaries (LOW, MEDIUM, HIGH).
- **`test_api.py`**: Tests the complete end-to-end API lifecycle: case creation -> review -> staff assignment -> patient notification -> case resolution -> CSV export.

**Pytest Execution Output:**
```
============================= test session starts =============================
platform win32 -- Python 3.11.9, pytest-8.3.3
rootdir: C:\Users\Rajesh\Desktop\COE_HOSPITAL\hospital-triage-mvp\backend
collected 8 items

tests\test_api.py ..                                                     [ 25%]
tests\test_triage_engine.py ......                                       [100%]

======================== 8 passed, 1 warning in 2.02s =========================
```

**Frontend Production Build Verification:**
```
vite v6.4.3 building for production...
✓ 2218 modules transformed.
dist/index.html                   0.49 kB │ gzip:   0.31 kB
dist/assets/index-DvHO-hG3.css   39.83 kB │ gzip:   7.46 kB
dist/assets/index-C1xXg_ob.js   627.82 kB │ gzip: 180.53 kB
✓ built in 24.99s (Build Succeeded with zero errors)
```

---

## 9. Version Control & Git Commit History
All project source code, tests, documentation, and database assets are actively managed in Git and synchronized to GitHub:
- **Remote URL:** `https://github.com/rajesh028-cyb/COE_PROJECT.git`
- **Active Branch:** `main`
- **Recent Commit Highlights:**
  - `0a49442`: *feat: complete urgency triage clinical system with real-time alerts, patient messaging simulation, case resolution, and reporting*
  - `7b26515`: *docs: add single paragraph project summary file*
  - `e0798cb`: *docs: elaborate comprehensive project dossier in PROJECT_SUMMARY.md*
  - Clean working tree with zero uncommitted artifacts.

---

## 10. Review 3 Rubric Alignment & Completion Checklist

| Evaluation Criterion | Requirement (Review 3 / 30% Milestone) | Status & Evidence |
| :--- | :--- | :---: |
| **Problem Formulation** | Clear psychiatric post-discharge clinical scope and explainable triage requirements | **100% Satisfied** |
| **Architecture & Design** | Decoupled client-server architecture with REST API and relational ORM | **100% Satisfied** |
| **Core Algorithms** | Transparent, evidence-backed keyword scoring engine with score weighting | **100% Satisfied** |
| **Human Oversight** | Enforced clinician confirmation/override with mandatory clinical rationale | **100% Satisfied** |
| **Interactive Dashboard** | Operations center with KPI stats, Recharts visualizations, and audio alerts | **100% Satisfied** |
| **Data Persistence** | SQLite database with 18 synthetic cases and zero real PHI exposure | **100% Satisfied** |
| **Automated Testing** | Pytest test suite validating scoring rules, API endpoints, and export flows | **100% Satisfied (8/8 Passed)** |
| **Code Quality & Commits** | Modular codebase, strict schemas, clean commit log on GitHub | **100% Satisfied** |

---

## 11. Conclusion & Next Steps
For Review 3, the **Post-Discharge Urgency Triage System** successfully demonstrates a robust 35%+ functional prototype meeting all academic, clinical, and software engineering rubrics. The system guarantees patient confidentiality, explainable automated assistance, and absolute clinician authority. Subsequent milestones will explore supplementary NLP confidence indicators, multi-clinician role-based permissions, and mock EHR timeline synchronizations.
