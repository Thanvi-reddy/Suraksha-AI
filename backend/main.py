from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from risk_engine import get_network_snapshot, get_combined_risk, EVENTS, NETWORK, BASELINE
from simulation_engine import simulate_disruption, compare_scenarios
from orchestrator import ask_copilot, generate_procurement_plan

app = FastAPI(title="Resilio AI API", version="1.0.0")

# Allow React frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# --- Request models ---
class ScenarioRequest(BaseModel):
    affected_routes: List[str]
    duration_days: int
    severity_override: Optional[float] = None
    label: Optional[str] = "Scenario"

class ChatRequest(BaseModel):
    question: str
    current_date: str
    scenario: Optional[dict] = None

class CompareRequest(BaseModel):
    scenarios: List[dict]

# --- Endpoints ---

@app.get("/api/health")
def health():
    return {"status": "Resilio AI is running", "version": "1.0.0"}

@app.get("/api/events")
def get_all_events():
    """Full crisis timeline for the timeline scrubber"""
    return {"events": EVENTS}

@app.get("/api/baseline")
def get_baseline():
    """Pre-crisis reference data"""
    return BASELINE

@app.get("/api/network-config")
def get_network_config():
    """Static network structure"""
    return NETWORK

@app.get("/api/network/{date}")
def get_network(date: str):
    """
    Full network risk snapshot for a given date.
    Called every time the timeline slider moves.
    """
    try:
        snapshot = get_network_snapshot(date)
        return snapshot
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/risk/{route_id}/{date}")
def get_route_risk(route_id: str, date: str):
    """Single route risk with full breakdown"""
    try:
        return get_combined_risk(route_id, date)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/simulate")
def run_simulation(request: ScenarioRequest):
    """Run a disruption scenario"""
    scenario = {
        "affected_routes": request.affected_routes,
        "duration_days": request.duration_days,
        "label": request.label
    }
    if request.severity_override:
        scenario["severity_override"] = request.severity_override
    return simulate_disruption(scenario)

@app.post("/api/compare")
def run_comparison(request: CompareRequest):
    """Compare multiple scenarios side by side"""
    return {"comparisons": compare_scenarios(request.scenarios)}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """AI copilot endpoint"""
    result = ask_copilot(
        user_question=request.question,
        current_date=request.current_date,
        scenario=request.scenario
    )
    return result

@app.post("/api/procurement-plan")
async def procurement_plan(request: ScenarioRequest):
    """Generate full procurement response plan"""
    scenario = {
        "affected_routes": request.affected_routes,
        "duration_days": request.duration_days
    }
    if request.severity_override:
        scenario["severity_override"] = request.severity_override
    sim_result = simulate_disruption(scenario)
    return generate_procurement_plan(sim_result)