import os
import json
import math
from datetime import datetime, timedelta
from dateutil import parser
from fetch_january_2026 import download_january_actuals, download_january_forecasts

CACHE_DIR = os.path.join(os.path.dirname(__file__), "cache")
ACTUALS_FILE = os.path.join(CACHE_DIR, "actuals_jan_2026.json")
FORECASTS_FILE = os.path.join(CACHE_DIR, "forecasts_jan_2026.json")

# In-memory storage for pre-parsed data and pre-sorted forecasts
_CACHED_ACTUALS = None
_CACHED_FC_BY_TARGET = None
_AVAILABLE_DATES = None


def load_data():
    """Loads and indexes cached Elexon data once into memory, auto-downloading if missing."""
    global _CACHED_ACTUALS, _CACHED_FC_BY_TARGET, _AVAILABLE_DATES

    if _CACHED_ACTUALS is not None:
        return _CACHED_ACTUALS, _CACHED_FC_BY_TARGET, _AVAILABLE_DATES

    if not os.path.exists(ACTUALS_FILE) or not os.path.exists(FORECASTS_FILE):
        print("[Info] Cache not found. Auto-downloading January 2026 Elexon data...")
        download_january_actuals()
        download_january_forecasts()

    with open(ACTUALS_FILE, "r", encoding="utf-8") as f:
        raw_actuals = json.load(f)

    with open(FORECASTS_FILE, "r", encoding="utf-8") as f:
        raw_forecasts = json.load(f)

    # Pre-parse actuals and store parsed target datetime and date strings
    parsed_actuals = []
    dates_set = set()
    for act in raw_actuals:
        target_str = act["startTime"]
        target_dt = parser.isoparse(target_str)
        delivery_date = target_dt.strftime("%Y-%m-%d")
        dates_set.add(delivery_date)
        parsed_actuals.append({
            "startTime": target_str,
            "target_dt": target_dt,
            "deliveryDate": delivery_date,
            "settlementPeriod": act.get("settlementPeriod"),
            "generation": float(act["generation"])
        })

    # Group and pre-sort forecasts by target startTime with pre-parsed publishTime
    fc_by_target = {}
    for fc in raw_forecasts:
        target = fc["startTime"]
        if target not in fc_by_target:
            fc_by_target[target] = []
        fc_by_target[target].append({
            "generation": float(fc["generation"]),
            "publishTime": fc["publishTime"],
            "publish_dt": parser.isoparse(fc["publishTime"])
        })

    for target in fc_by_target:
        fc_by_target[target].sort(key=lambda x: x["publish_dt"])

    _CACHED_ACTUALS = parsed_actuals
    _CACHED_FC_BY_TARGET = fc_by_target
    _AVAILABLE_DATES = sorted(list(dates_set))

    return _CACHED_ACTUALS, _CACHED_FC_BY_TARGET, _AVAILABLE_DATES


def get_available_dates():
    """Returns the list of delivery dates available in the cache."""
    _, _, dates = load_data()
    return dates


def compute_metrics(records):
    """Calculates MAE, RMSE, Bias (MBE), MAPE, and P90 Shortfall."""
    if not records:
        return {
            "mae_mw": 0,
            "rmse_mw": 0,
            "bias_mw": 0,
            "mape_percent": 0,
            "p90_risk_buffer_mw": 0,
            "evaluated_periods": 0
        }

    errors = [r["errorMW"] for r in records]
    abs_errors = [abs(e) for e in errors]
    squared_errors = [e ** 2 for e in errors]

    # Positive errors = Over-forecasting (shortfall risk where actual wind < forecast)
    shortfalls = [e for e in errors if e > 0]

    mae = sum(abs_errors) / len(errors)
    rmse = math.sqrt(sum(squared_errors) / len(squared_errors))
    bias = sum(errors) / len(errors)

    # MAPE: avoid division by zero (filter out actuals under 100 MW)
    valid_mape = [r for r in records if r["actualMW"] > 100]
    if valid_mape:
        mape = (
            sum(abs(r["errorMW"]) / r["actualMW"] for r in valid_mape)
            / len(valid_mape)
        ) * 100
    else:
        mape = 0.0

    # P90 Shortfall
    if shortfalls:
        shortfalls.sort()
        idx = int(0.90 * len(shortfalls))
        p90_risk = shortfalls[min(idx, len(shortfalls) - 1)]
    else:
        p90_risk = 0.0

    return {
        "mae_mw": round(mae, 1),
        "rmse_mw": round(rmse, 1),
        "bias_mw": round(bias, 1),
        "mape_percent": round(mape, 1),
        "p90_risk_buffer_mw": round(p90_risk, 1),
        "evaluated_periods": len(records)
    }


def get_forecast_evaluation(cutoff_hour=12, filter_date="2026-01-01"):
    actuals, fc_by_target, available_dates = load_data()

    all_paired_records = []

    for act in actuals:
        target_str = act["startTime"]
        target_dt = act["target_dt"]
        delivery_date = act["deliveryDate"]

        # Gate Closure: Day D-1 at cutoff_hour
        day_minus_1 = (target_dt - timedelta(days=1)).date()
        cutoff_dt = datetime(
            day_minus_1.year,
            day_minus_1.month,
            day_minus_1.day,
            cutoff_hour,
            0,
            0,
            tzinfo=target_dt.tzinfo
        )

        # Match exact target or fallback for half-hour :30
        lookup_target = target_str
        if lookup_target not in fc_by_target and target_dt.minute == 30:
            hour_dt = target_dt.replace(minute=0)
            lookup_target = hour_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

        eligible_forecasts = []
        if lookup_target in fc_by_target:
            for f in fc_by_target[lookup_target]:
                if f["publish_dt"] <= cutoff_dt:
                    eligible_forecasts.append(f)

        if eligible_forecasts:
            latest_fc = eligible_forecasts[-1]
            act_gen = act["generation"]
            fc_gen = latest_fc["generation"]
            err = fc_gen - act_gen

            all_paired_records.append({
                "startTime": target_str,
                "timeLabel": target_dt.strftime("%H:%M"),
                "deliveryDate": delivery_date,
                "settlementPeriod": act.get("settlementPeriod"),
                "actualMW": round(act_gen, 1),
                "forecastMW": round(fc_gen, 1),
                "errorMW": round(err, 1),
                "publishTime": latest_fc["publishTime"]
            })

    # Sort strictly chronologically by startTime (00:00 -> 23:30)
    all_paired_records.sort(key=lambda r: r["startTime"])

    monthly_metrics = compute_metrics(all_paired_records)

    if filter_date and filter_date != "all":
        selected_records = [
            r for r in all_paired_records if r["deliveryDate"] == filter_date
        ]
        active_metrics = compute_metrics(selected_records)
    else:
        selected_records = all_paired_records
        active_metrics = monthly_metrics

    bias = active_metrics["bias_mw"]
    bias_direction = "over-predicting" if bias > 0 else "under-predicting"
    bias_action = "derate day-ahead wind bids" if bias > 0 else "safely rely on wind bids"

    recommendation = (
        f"Wind models show an average {abs(bias)} MW {bias_direction} bias "
        f"(MAE: {active_metrics['mae_mw']} MW). To prevent punitive balancing cash-out penalties, "
        f"{bias_action} by {abs(bias)} MW and contract a +{active_metrics['p90_risk_buffer_mw']} MW "
        f"thermal reserve margin across peak periods."
    )

    return {
        "filter": {
            "cutoff_hour": cutoff_hour,
            "selected_date": filter_date
        },
        "metrics": active_metrics,
        "monthly_benchmark": monthly_metrics,
        "recommendation": recommendation,
        "availableDates": available_dates,
        "chartData": selected_records
    }
