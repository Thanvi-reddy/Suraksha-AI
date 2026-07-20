from risk_engine import BASELINE, NETWORK, get_network_snapshot, find_historical_analog


def simulate_disruption(scenario: dict) -> dict:
    """
    Given a scenario, compute full downstream impact.
    
    INPUT:
    scenario = {
        "affected_routes": ["hormuz", "saudi_pipeline"],
        "duration_days": 30,
        "severity_override": 91  (optional)
    }
    
    OUTPUT: supply reduction, cost impact, survival days,
    affected refineries, recommendations input
    """
    affected_routes = scenario.get("affected_routes", [])
    duration_days = scenario.get("duration_days", 30)
    severity = scenario.get("severity_override", 85)

    # --- Step 1: Supply reduction ---
    # How much of India's imports flow through affected routes?
    route_dist = BASELINE["route_distribution"]
    affected_import_pct = 0
    for route_id in affected_routes:
        key = f"{route_id}_pct"
        affected_import_pct += route_dist.get(key, 0)

    # 60% can be rerouted, 40% is genuinely lost short-term
    lost_pct = affected_import_pct * 0.40
    supply_reduction_pct = round(lost_pct, 1)

    # --- Step 2: Cost impact ---
    # Formula: affected_volume x price_delta x duration
    # Fully explainable — this is what we show judges
    baseline_brent = BASELINE["oil_prices"]["brent_usd"]
    price_delta = (severity / 100) * 45
    # $45 = real peak delta from our data ($71 baseline -> $116 peak)

    daily_imports = BASELINE["supply"]["daily_imports_bpd"]
    affected_volume = daily_imports * (affected_import_pct / 100)
    cost_usd = affected_volume * price_delta * duration_days
    cost_billion = round(cost_usd / 1_000_000_000, 2)

    cost_formula = (
        f"{int(affected_volume):,} bpd x "
        f"${round(price_delta, 1)}/bbl x "
        f"{duration_days} days = ${cost_billion}B"
    )

    # --- Step 3: Survival analysis ---
    spr_days = BASELINE["reserves"]["spr_days_coverage"]
    commercial_days = BASELINE["reserves"]["commercial_stock_days"]
    total_buffer_days = BASELINE["reserves"]["total_buffer_days"]

    daily_consumption = BASELINE["supply"]["daily_consumption_bpd"]
    supply_gap_bpd = daily_imports * (supply_reduction_pct / 100)

    if supply_gap_bpd > 0:
        gap_ratio = supply_gap_bpd / daily_consumption
        survival_days = round(total_buffer_days / (1 + gap_ratio), 0)
    else:
        survival_days = total_buffer_days

    days_to_critical = max(0, round(survival_days - 10, 0))

    # --- Step 4: Affected refineries ---
    affected_refineries = []
    for refinery in NETWORK["refineries"]:
        supplied_by = set(refinery.get("supplied_by_routes", []))
        if supplied_by & set(affected_routes):
            affected_refineries.append({
                "id": refinery["id"],
                "name": refinery["name"],
                "state": refinery["state"],
                "capacity_bpd": refinery["capacity_bpd"]
            })

    # --- Step 5: Historical analog ---
    analog = find_historical_analog(affected_routes)

    # --- Step 6: Safe alternative suppliers ---
    safe_suppliers = []
    for supplier in NETWORK["suppliers"]:
        supplier_routes = set(supplier.get("via_routes", []))
        if not (supplier_routes & set(affected_routes)):
            confidence = round(100 - (supplier["discount_to_brent"] * 2), 0)
            confidence = max(60, min(95, confidence))
            safe_suppliers.append({
                "id": supplier["id"],
                "name": supplier["name"],
                "flag": supplier["flag"],
                "current_share_pct": supplier["share_pct"],
                "via_routes": supplier["via_routes"],
                "confidence_pct": int(confidence),
                "reason": supplier["note"]
            })

    safe_suppliers.sort(key=lambda x: x["confidence_pct"], reverse=True)

    # --- Step 7: Alert level ---
    if supply_reduction_pct > 20:
        alert_level = "CRITICAL"
    elif supply_reduction_pct > 10:
        alert_level = "HIGH"
    else:
        alert_level = "MEDIUM"

    return {
        "scenario": scenario,
        "alert_level": alert_level,
        "supply_reduction_pct": supply_reduction_pct,
        "affected_import_pct": affected_import_pct,
        "cost_impact_billion_usd": cost_billion,
        "cost_formula": cost_formula,
        "price_delta_per_barrel": round(price_delta, 1),
        "survival_days": int(survival_days),
        "days_to_critical_shortage": int(days_to_critical),
        "spr_days_available": spr_days,
        "recommended_spr_drawdown_days": min(7, spr_days),
        "affected_refineries": affected_refineries,
        "safe_alternatives": safe_suppliers[:4],
        "historical_analog": analog
    }


def compare_scenarios(scenarios: list) -> list:
    """
    Run multiple scenarios side by side.
    Used for the scenario comparison feature.
    """
    results = []
    for scenario in scenarios:
        result = simulate_disruption(scenario)
        results.append({
            "label": scenario.get("label", "Scenario"),
            "affected_routes": scenario["affected_routes"],
            "duration_days": scenario["duration_days"],
            "supply_reduction_pct": result["supply_reduction_pct"],
            "cost_billion_usd": result["cost_impact_billion_usd"],
            "survival_days": result["survival_days"],
            "alert_level": result["alert_level"],
            "safe_alternatives_count": len(result["safe_alternatives"])
        })
    return results