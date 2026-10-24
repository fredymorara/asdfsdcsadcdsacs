import os
import json
import requests

CACHE_DIR = os.path.join(os.path.dirname(__file__), "cache")
os.makedirs(CACHE_DIR, exist_ok=True)

ACTUALS_FILE = os.path.join(CACHE_DIR, "actuals_jan_2026.json")
FORECASTS_FILE = os.path.join(CACHE_DIR, "forecasts_jan_2026.json")

HEADERS = {"Accept": "application/json"}
BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets"


def download_january_actuals():
    print("[1/2] Fetching complete FUELHH (Actuals) for January 2026 from Elexon...")
    url = f"{BASE_URL}/FUELHH/stream"
    params = {
        "settlementDateFrom": "2026-01-01",
        "settlementDateTo": "2026-01-31",
        "fuelType": "WIND"
    }
    
    resp = requests.get(url, params=params, headers=HEADERS, timeout=60)
    resp.raise_for_status()
    data = resp.json()

    wind_actuals = [
        {
            "startTime": d["startTime"],
            "settlementDate": d.get("settlementDate"),
            "settlementPeriod": d.get("settlementPeriod"),
            "fuelType": "WIND",
            "generation": float(d["generation"])
        }
        for d in data if d.get("fuelType") == "WIND"
    ]

    with open(ACTUALS_FILE, "w", encoding="utf-8") as f:
        json.dump(wind_actuals, f)

    print(f" -> Successfully saved {len(wind_actuals)} actual records to {ACTUALS_FILE}")


def download_january_forecasts():
    print("[2/2] Fetching complete WINDFOR (Forecasts) for January 2026 from Elexon...")
    # We query from 2025-12-30 so that Day-Ahead forecasts for Jan 1 are captured!
    url = f"{BASE_URL}/WINDFOR/stream"
    params = {
        "publishDateTimeFrom": "2025-12-30T00:00:00Z",
        "publishDateTimeTo": "2026-02-01T23:59:59Z"
    }

    resp = requests.get(url, params=params, headers=HEADERS, timeout=120)
    resp.raise_for_status()
    data = resp.json()

    wind_forecasts = [
        {
            "startTime": d["startTime"],
            "publishTime": d["publishTime"],
            "generation": float(d["generation"])
        }
        for d in data
    ]

    with open(FORECASTS_FILE, "w", encoding="utf-8") as f:
        json.dump(wind_forecasts, f)

    print(f" -> Successfully saved {len(wind_forecasts)} forecast records to {FORECASTS_FILE}")


if __name__ == "__main__":
    download_january_actuals()
    download_january_forecasts()
    print("\n All January 2026 live Elexon data downloaded and cached successfully!")