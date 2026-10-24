import pytest
from app import app
from elexon_service import compute_metrics


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_health_endpoint(client):
    """Test that the /api/health endpoint returns healthy status."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "healthy"
    assert data["cache_loaded"] is True


def test_forecast_analysis_endpoint(client):
    """Test the /api/forecast-analysis endpoint returns expected structure."""
    res = client.get("/api/forecast-analysis?cutoff_hour=12&date=2026-01-05")
    assert res.status_code == 200
    data = res.get_json()

    # Check root keys exist
    assert "metrics" in data
    assert "chartData" in data
    assert "recommendation" in data
    assert "availableDates" in data

    # Check metrics keys
    metrics = data["metrics"]
    assert "mae_mw" in metrics
    assert "bias_mw" in metrics
    assert "p90_risk_buffer_mw" in metrics
    assert metrics["evaluated_periods"] == 48


def test_forecast_analysis_invalid_cutoff(client):
    """Test validation when cutoff_hour is out of bounds or non-numeric."""
    # Negative hour
    res_neg = client.get("/api/forecast-analysis?cutoff_hour=-1&date=2026-01-05")
    assert res_neg.status_code == 400
    assert "cutoff_hour" in res_neg.get_json()["error"]

    # Hour > 23
    res_high = client.get("/api/forecast-analysis?cutoff_hour=24&date=2026-01-05")
    assert res_high.status_code == 400

    # Non-numeric string
    res_str = client.get("/api/forecast-analysis?cutoff_hour=noon&date=2026-01-05")
    assert res_str.status_code == 400


def test_forecast_analysis_invalid_date(client):
    """Test validation when date format is malformed or outside dataset."""
    # Malformed date string
    res_malformed = client.get("/api/forecast-analysis?date=2026-13-45")
    assert res_malformed.status_code == 400
    assert "Invalid date format" in res_malformed.get_json()["error"]

    # Date outside January 2026
    res_not_found = client.get("/api/forecast-analysis?date=2025-06-15")
    assert res_not_found.status_code == 404
    assert "not found in January 2026" in res_not_found.get_json()["error"]


def test_metric_calculations():
    """Unit test for the compute_metrics function."""
    sample_records = [
        {"actualMW": 1000, "forecastMW": 1200, "errorMW": 200},   # Over-forecast by 200
        {"actualMW": 1000, "forecastMW": 800,  "errorMW": -200},  # Under-forecast by 200
        {"actualMW": 1000, "forecastMW": 1100, "errorMW": 100},   # Over-forecast by 100
    ]
    res = compute_metrics(sample_records)

    # MAE should be (200 + 200 + 100) / 3 = 166.7
    assert round(res["mae_mw"], 1) == 166.7
    # Bias should be (200 - 200 + 100) / 3 = 33.3
    assert round(res["bias_mw"], 1) == 33.3
