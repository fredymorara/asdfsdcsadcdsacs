import requests
import json

headers = {"Accept": "application/json"}

print("========================================")
print("1. Testing FUELHH (Actuals) for Jan 2026")
print("========================================")

url_fuelhh = "https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream"
params_fuelhh = {
    "settlementDateFrom": "2026-01-01",
    "settlementDateTo": "2026-01-03",  # testing 3 days first
    "fuelType": "WIND"
}

resp_fuel = requests.get(url_fuelhh, params=params_fuelhh, headers=headers, timeout=30)
print(f"FUELHH Status Code: {resp_fuel.status_code}")

if resp_fuel.status_code == 200:
    data_fuel = resp_fuel.json()
    print(f"Total FUELHH records retrieved: {len(data_fuel)}")
    if data_fuel:
        print("Sample actual record:")
        print(json.dumps(data_fuel[0], indent=2))
else:
    print("FUELHH Error Response:", resp_fuel.text)

print("\n========================================")
print("2. Testing WINDFOR (Forecasts) for Jan 2026")
print("========================================")

url_windfor = "https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream"
params_windfor = {
    "publishDateTimeFrom": "2025-12-31T00:00:00Z",
    "publishDateTimeTo": "2026-01-03T23:59:59Z"  # testing 3 days first
}

resp_wind = requests.get(url_windfor, params=params_windfor, headers=headers, timeout=30)
print(f"WINDFOR Status Code: {resp_wind.status_code}")

if resp_wind.status_code == 200:
    data_wind = resp_wind.json()
    print(f"Total WINDFOR records retrieved: {len(data_wind)}")
    if data_wind:
        print("Sample forecast record:")
        print(json.dumps(data_wind[0], indent=2))
else:
    print("WINDFOR Error Response:", resp_wind.text)