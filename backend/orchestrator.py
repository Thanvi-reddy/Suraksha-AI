import os
import json
from groq import Groq
from dotenv import load_dotenv
from risk_engine import get_network_snapshot, find_historical_analog
from simulation_engine import simulate_disruption

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def build_system_prompt() -> str:
    return """You are Resilio AI's decision intelligence engine for India's energy supply chain.

CRITICAL RULES:
1. NEVER invent numbers. All figures come from the structured data provided to you.
2. Use EXACT numbers from the data — supply reduction %, cost figures, survival days.
3. Explain WHY a route is risky using the event notes in the data.
4. Keep responses concise — procurement analysts are time-pressured.
5. Always end recommendations with the confidence score from the data.

Your job: explain, narrate, and rank. Never compute or estimate independently."""


def ask_copilot(
    user_question: str,
    current_date: str,
    scenario: dict = None
) -> dict:
    """
    Main conversational interface.
    Gets REAL numbers from engines, sends to Groq for explanation only.
    """
    # Step 1: Get real computed data
    network_state = get_network_snapshot(current_date)

    simulation_result = None
    if scenario:
        simulation_result = simulate_disruption(scenario)

    # Step 2: Build structured context
    route_summary = {}
    for route_id, data in network_state["route_risks"].items():
        route_summary[route_id] = {
            "score": data["combined_score"],
            "level": data["level"],
            "confidence": data["confidence_pct"],
            "explanation": data["explanation"]
        }

    context = {
        "current_date": current_date,
        "national_risk_score": network_state["national_risk_score"],
        "national_risk_level": network_state["national_risk_level"],
        "brent_price_usd": network_state["brent_price"],
        "india_basket_price_usd": network_state["india_basket_price"],
        "volume_affected_pct": network_state["volume_affected_pct"],
        "latest_event": network_state["latest_event"],
        "route_risks": route_summary,
        "simulation": simulation_result
    }

    # Step 3: Call Groq
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": build_system_prompt()
            },
            {
                "role": "user",
                "content": f"""Current supply chain state (computed by risk engine):
{json.dumps(context, indent=2)}

User question: {user_question}

Provide a clear, actionable response using ONLY the numbers above.
If simulation data is present, base impact assessment on it.
Format recommendations as numbered list with confidence scores."""
            }
        ],
        max_tokens=1000
    )

    return {
        "answer": response.choices[0].message.content,
        "data_used": context,
        "current_date": current_date
    }


def generate_procurement_plan(simulation_result: dict) -> dict:
    """
    Generate ranked procurement action plan from simulation output.
    """
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": build_system_prompt()
            },
            {
                "role": "user",
                "content": f"""Simulation results (do not modify these numbers):
{json.dumps(simulation_result, indent=2)}

Generate a ranked procurement response plan with:

IMMEDIATE ACTIONS (0-7 days):
SHORT-TERM ACTIONS (7-30 days):
STRATEGIC ACTIONS (30+ days):

For each action include:
- What to do
- Confidence score (from safe_alternatives confidence_pct)
- Why (cite specific risk data)
- Historical precedent if available

Be concise and actionable."""
            }
        ],
        max_tokens=1000
    )

    return {
        "plan": response.choices[0].message.content,
        "simulation_basis": {
            "supply_reduction_pct": simulation_result["supply_reduction_pct"],
            "cost_billion_usd": simulation_result["cost_impact_billion_usd"],
            "survival_days": simulation_result["survival_days"],
            "alert_level": simulation_result["alert_level"]
        }
    }