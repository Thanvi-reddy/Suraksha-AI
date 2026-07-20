import json
from datetime import datetime
from pathlib import Path

# Load data files once at startup
DATA_DIR = Path(__file__).parent / "data"

with open(DATA_DIR / "events.json") as f:
    EVENTS = json.load(f)

with open(DATA_DIR / "routes.json") as f:
    NETWORK = json.load(f)

with open(DATA_DIR / "baseline.json") as f:
    BASELINE = json.load(f)


def get_events_up_to_date(target_date: str) -> list:
    """
    Returns only events that happened ON or BEFORE the target date.
    This is how the timeline scrubber works.
    Move slider to March 4 -> only events up to March 4 are visible.
    """
    target = datetime.strptime(target_date, "%Y-%m-%d").date()
    return [
        e for e in EVENTS
        if datetime.strptime(e["date"], "%Y-%m-%d").date() <= target
    ]


def get_base_risk(route_id: str, target_date: str) -> dict:
    """
    Base risk = direct risk to THIS route from events that affect it.
    
    Example:
    - March 4: Hormuz gets severity 91 (Iran closed it)
    - Saudi pipeline on same date: base risk = 8 (not attacked yet)
    """
    route_config = next(
        (r for r in NETWORK["routes"] if r["id"] == route_id), None
    )
    if not route_config:
        return {"score": 50, "reason": "Unknown route", "event": None}

    relevant_events = [
        e for e in get_events_up_to_date(target_date)
        if route_id in e["affected_routes"]
    ]

    if not relevant_events:
        base = route_config["baseline_risk"]
        return {
            "score": base,
            "reason": f"No disruption events detected. Normal baseline risk.",
            "event": None
        }

    # Take the most recent event affecting this route
    most_recent = sorted(relevant_events, key=lambda x: x["date"])[-1]
    return {
        "score": most_recent["severity"],
        "reason": most_recent["note"],
        "event": most_recent["event_name"]
    }


def get_substitution_pressure(route_id: str, all_base_risks: dict) -> dict:
    """
    THE CORE DIFFERENTIATOR - Interdependent Risk Propagation.
    
    When Hormuz closes, everyone rushes to alternatives.
    Saudi pipeline and Fujairah share Gulf infrastructure.
    Their risk rises too as substitution pressure builds.
    
    This is EXACTLY what happened in April 2026:
    - Hormuz closed (March 4)
    - Everyone rushed to Saudi pipeline and Fujairah
    - Iran then attacked BOTH of those too (April 1 and April 7)
    
    Formula:
    For each peer route sharing infrastructure with this route:
        if peer risk > 70: pressure += peer_risk * vulnerability * 0.5
    """
    route_config = next(
        (r for r in NETWORK["routes"] if r["id"] == route_id), None
    )
    if not route_config:
        return {"score": 0, "reason": "No peer routes", "peers": []}

    peers = route_config.get("shares_infrastructure_with", [])
    pressure = 0
    peers_affected = []

    for peer_id in peers:
        peer_risk = all_base_risks.get(peer_id, {}).get("score", 0)
        if peer_risk > 70:
            contribution = peer_risk * route_config["vulnerability_factor"] * 0.5
            pressure += contribution
            peers_affected.append({
                "peer_id": peer_id,
                "peer_risk": peer_risk,
                "contribution": round(contribution, 1)
            })

    pressure = round(min(pressure, 60), 1)

    if pressure > 0:
        reason = f"Substitution pressure from high-risk peer routes: {[p['peer_id'] for p in peers_affected]}"
    else:
        reason = "No significant substitution pressure"

    return {
        "score": pressure,
        "reason": reason,
        "peers": peers_affected
    }


def get_combined_risk(route_id: str, target_date: str) -> dict:
    """
    Final risk score = base_risk + substitution_pressure (capped at 100)
    
    This is what gets displayed on the map as the colored risk level.
    Color coding:
    - Green:  0-39  (LOW RISK)
    - Orange: 40-74 (MEDIUM RISK)
    - Red:    75+   (HIGH RISK)
    """
    # Get base risks for ALL routes first (needed for substitution calc)
    all_base_risks = {}
    for route in NETWORK["routes"]:
        all_base_risks[route["id"]] = get_base_risk(route["id"], target_date)

    base = get_base_risk(route_id, target_date)
    pressure = get_substitution_pressure(route_id, all_base_risks)

    combined = min(100, round(base["score"] + pressure["score"], 1))

    # Confidence: higher risk = slightly more uncertainty
    confidence = max(60, round(100 - (combined * 0.12), 0))

    # Color and level
    if combined >= 75:
        color = "red"
        level = "HIGH RISK"
    elif combined >= 40:
        color = "orange"
        level = "MEDIUM RISK"
    else:
        color = "green"
        level = "LOW RISK"

    return {
        "route_id": route_id,
        "date": target_date,
        "combined_score": combined,
        "color": color,
        "level": level,
        "confidence_pct": int(confidence),
        "breakdown": {
            "base_risk": base,
            "substitution_pressure": pressure
        },
        "explanation": base["reason"]
    }


def get_network_snapshot(target_date: str) -> dict:
    """
    Full network state at a given date.
    Called every time the timeline slider moves.
    Returns risk scores for ALL routes + latest event + prices.
    """
    route_risks = {}
    for route in NETWORK["routes"]:
        route_risks[route["id"]] = get_combined_risk(route["id"], target_date)

    # Events up to this date
    past_events = get_events_up_to_date(target_date)
    latest_event = past_events[-1] if past_events else None

    # National risk = weighted average by route capacity
    total_capacity = sum(r["capacity_bpd"] for r in NETWORK["routes"])
    weighted_risk = sum(
        route_risks[r["id"]]["combined_score"] * (r["capacity_bpd"] / total_capacity)
        for r in NETWORK["routes"]
    )
    national_risk = round(weighted_risk, 1)

    if national_risk >= 65:
        national_level = "HIGH RISK"
        national_color = "red"
    elif national_risk >= 35:
        national_level = "MEDIUM RISK"
        national_color = "orange"
    else:
        national_level = "LOW RISK"
        national_color = "green"

    return {
        "date": target_date,
        "national_risk_score": national_risk,
        "national_risk_level": national_level,
        "national_risk_color": national_color,
        "route_risks": route_risks,
        "latest_event": latest_event,
        "brent_price": latest_event["brent_price_usd"] if latest_event else BASELINE["oil_prices"]["brent_usd"],
        "india_basket_price": latest_event["india_basket_price_usd"] if latest_event else BASELINE["oil_prices"]["india_basket_usd"],
        "volume_affected_pct": latest_event["volume_affected_pct"] if latest_event else 0,
        "total_events_so_far": len(past_events)
    }


def find_historical_analog(affected_routes: list) -> dict:
    """
    Crisis Memory Engine.
    Finds the most similar past event based on which routes are affected.
    Used to say: 'This resembles the April 2026 Saudi pipeline attack.'
    """
    best_match = None
    best_overlap = 0

    for event in EVENTS:
        if not event["affected_routes"]:
            continue
        overlap = len(set(affected_routes) & set(event["affected_routes"]))
        if overlap > best_overlap:
            best_overlap = overlap
            best_match = event

    if not best_match:
        return {"found": False}

    return {
        "found": True,
        "analog_event": best_match["event_name"],
        "analog_date": best_match["date"],
        "analog_severity": best_match["severity"],
        "historical_outcome": best_match["note"],
        "similarity": f"Both events affect: {list(set(affected_routes) & set(best_match['affected_routes']))}"
    }