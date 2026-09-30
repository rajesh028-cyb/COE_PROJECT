# Post-Discharge Urgency Triage System — Comprehensive Project Dossier

## 1. Executive Summary
The **Post-Discharge Urgency Triage System** is a field-ready, human-in-the-loop clinical decision-support and operations platform engineered using a high-performance Python FastAPI backend and a responsive React (Vite) / Tailwind CSS frontend. Specifically designed for hospital psychiatric departments and outpatient mental health care teams, the platform addresses the critical transition period following acute psychiatric discharge when patients submit support, counselling, and helpline requests. The system automatically screens patient-submitted message text against transparent, explainable rule-based risk indicators to calculate an evidence-backed preliminary priority classification (`LOW`, `MEDIUM`, or `HIGH`). It enforces strict human oversight where authorized clinicians review evidence, confirm or override ratings, dispatch simulated patient communications, coordinate staff follow-up schedules, track clinical resolutions, and maintain an immutable compliance audit trail.

---

## 2. Clinical Problem & Operational Motivation
Patients discharged from acute inpatient psychiatric facilities face a vulnerable transition period where outpatient support channels receive a heterogeneous influx of requests. These range from routine administrative queries (such as appointment date confirmations and address updates) to acute clinical emergencies expressing active suicidal ideation, severe emotional distress, or sudden loss of support systems. Without systematic automated triage, clinical operations coordinators must manually parse unstructured messages sequentially, introducing cognitive fatigue and dangerous response delays for time-critical cases. Furthermore, many modern AI triage systems operate as opaque "black boxes," hindering clinician trust and creating ethical dilemmas. This system solves these issues through a 100% transparent, explainable rule-scoring engine where every priority rating is directly traceable to specific linguistic evidence.

---

## 3. Transparent Triage Rule Engine & Mathematical Scoring
The core intelligence layer operates via a deterministic keyword scoring engine (`backend/app/services/triage_engine.py`) that evaluates incoming text against clinical risk categories without utilizing uninterpretable black-box weights:
- **Safety Concern (+5 points)**: Triggered by critical safety and self-harm keywords (*e.g., "unsafe", "not safe", "danger", "can't keep myself safe", "harm", "end it"*).
- **Severe Distress (+3 points)**: Triggered by acute emotional distress expressions (*e.g., "extremely distressed", "overwhelmed", "can't cope", "desperate", "breaking down"*).
- **Urgency Language (+2 points)**: Triggered by explicit temporal urgency markers (*e.g., "immediately", "right now", "urgent", "asap"*).
- **Support Isolation (+2 points)**: Triggered by statements indicating absence of care network (*e.g., "alone", "no one to help", "nobody", "isolated"*).
- **Queue Operational Boost (+1 point)**: Automatically added if patient queue waiting time exceeds 30 minutes.

### Priority Classification Thresholds:
- **0 to 2 Points — LOW Priority (Green Badge)**: Routine inquiries, scheduled follow-ups, and positive check-ins.
- **3 to 5 Points — MEDIUM Priority (Amber Badge)**: Elevated anxiety, medication concerns, and moderate distress requiring timely contact.
- **6+ Points — HIGH Priority (Red Badge)**: Acute risk or safety concerns triggering immediate clinical attention and dashboard audio alarms.

---

## 4. End-to-End Human-in-the-Loop Workflow
The system strictly enforces the principle that **automated recommendations never finalize clinical decisions**:
1. **Confidential Patient Intake (`/intake`)**: Patients submit requests across multiple categories (*Counselling, Helpline, Follow-up, Appointment Support*) and contact preferences (*Phone, Email, Portal*). Internal risk scores, trigger keywords, and priority badges are strictly shielded from the patient interface.
2. **Clinical Operations Dashboard (`/dashboard`)**: Staff monitor incoming requests in real-time. Unreviewed high-priority cases trigger visual pulsing alerts and synthesized Web Audio alert chimes (with an ON/OFF toggle). The dashboard features 5 real-time KPI metrics, search filtering, and priority distribution charts.
3. **Evidence Inspection & Human Review (`/cases/{caseId}`)**: Clinicians inspect the full text alongside detected risk indicators and exact score calculations. Clinicians select **Confirm Priority** or **Override Priority** (`LOW`, `MEDIUM`, `HIGH`) and record a mandatory clinical justification note.
4. **Staff Assignment & Callback Scheduling**: Clinicians assign the case to designated staff roles (*Psychiatric Nurse, Clinical Social Worker, Outpatient Counsellor, Crisis Response Team*) with specific follow-up target due times.
5. **Patient Communication Simulation**: Clinicians trigger templated, simulated multi-channel messages (*SMS, Secure Email, Portal Notifications*) such as safety check-ins and appointment notices, persisting real-time delivery receipts.
6. **Case Resolution & Closure**: Following clinical intervention, clinicians document a formal disposition (*Safety Plan Formed & Verified, Follow-up Call Completed, Outpatient Appointment Scheduled, Referred to Crisis Team, Administrative Query Solved*) and resolution notes, transitioning the case to `Resolved`.
7. **Compliance Audit Trail & Reporting**: Every action is permanently recorded in a chronological audit ledger. Staff can download the complete case database via **CSV Export** or print a formatted **Clinical Handover Dossier (PDF/Print)**.

---

## 5. System Architecture & Technical Specifications
- **Frontend Stack**: React 18, Vite build system, Tailwind CSS v4 design system, Lucide React iconography, Recharts visual analytics, and native browser Web Audio API audio synthesis.
- **Backend Stack**: Python 3.10+, FastAPI asynchronous REST framework, SQLAlchemy 2.0 ORM, Pydantic v2 data models, and Uvicorn ASGI server.
- **Database Engine**: SQLite (`hospital_triage.db`) with relational schemas for `Case`, `Review`, `Followup`, `NotificationLog`, and `AuditLog`.
- **Testing & Quality Assurance**: Pytest integration test suite covering triage logic, API endpoints, communication dispatch, case resolution, and CSV streaming with 100% pass rate.
- **Synthetic Data Safety**: Seeded with 18 realistic synthetic patient profiles (`P001` to `P018`). Zero real Protected Health Information (PHI) is processed or stored.
