from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from elexon_service import get_forecast_evaluation, get_available_dates, load_data

app = Flask(__name__)

# Enable CORS so our React frontend can call this API
CORS(app)

# Warm up cache and in-memory indexes on startup
with app.app_context():
    try:
        load_data()
    except Exception as exc:
        app.logger.warning(f"Could not pre-warm Elexon cache on startup: {exc}")


@app.route("/api/health", methods=["GET"])
def health_check():
    """Simple health check endpoint for monitoring and deployment platforms."""
    return jsonify({
        "status": "healthy",
        "service": "UK Wind Generation Day-Ahead Forecast Monitor",
        "target_period": "January 2026",
        "cache_loaded": True
    })


@app.route("/api/forecast-analysis", methods=["GET"])
def forecast_analysis():
    """
    Main API endpoint for the React Dashboard.
    Query params:
      - cutoff_hour: Day-Ahead decision cutoff hour on D-1 (integer 0–23, default: 12)
      - date: Target delivery date in YYYY-MM-DD format (default: '2026-01-05')
    """
    try:
        # 1. Validate Cutoff Hour
        raw_cutoff = request.args.get("cutoff_hour", default="12", type=str)
        try:
            cutoff_hour = int(raw_cutoff)
        except ValueError:
            return jsonify({
                "error": f"Invalid 'cutoff_hour': '{raw_cutoff}'. Must be an integer between 0 and 23."
            }), 400

        if not (0 <= cutoff_hour <= 23):
            return jsonify({
                "error": f"'cutoff_hour' must be between 0 and 23 (received {cutoff_hour})."
            }), 400

        # 2. Validate Date Format and Availability
        filter_date = request.args.get("date", default="2026-01-05", type=str)
        available_dates = get_available_dates()

        if filter_date and filter_date != "all":
            # Check YYYY-MM-DD format
            try:
                datetime.strptime(filter_date, "%Y-%m-%d")
            except ValueError:
                return jsonify({
                    "error": f"Invalid date format: '{filter_date}'. Expected format: YYYY-MM-DD (e.g. 2026-01-05)."
                }), 400

            # Check if date is within January 2026 available dates
            if filter_date not in available_dates:
                return jsonify({
                    "error": f"Date '{filter_date}' not found in January 2026 dataset.",
                    "availableDates": available_dates
                }), 404

        result = get_forecast_evaluation(cutoff_hour=cutoff_hour, filter_date=filter_date)
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Host 0.0.0.0 allows Docker and local access on port 5000
    app.run(host="0.0.0.0", port=5000, debug=True)
