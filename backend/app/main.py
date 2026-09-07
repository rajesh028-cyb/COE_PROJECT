from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import cases, dashboard

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Post-Discharge Urgency Triage API",
    description="Human-reviewed urgency triage prototype for counselling and helpline requests following acute psychiatric care discharge.",
    version="1.0.0"
)

# CORS Middleware setup for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows local Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(cases.router)
app.include_router(dashboard.router)

@app.get("/")
def root():
    return {
        "status": "healthy",
        "system": "Post-Discharge Urgency Triage System MVP",
        "disclaimer": "Synthetic prototype for research & college demonstration. Human review required."
    }
