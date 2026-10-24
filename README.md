# UK Day-Ahead Wind Generation Forecast Verification & Imbalance Cockpit

A production-grade full-stack web application designed for UK electricity utility trading & dispatch desks. The platform enables power traders to evaluate day-ahead wind forecast accuracy against actual Elexon BMRS outturn, quantify financial exposure under Balancing Mechanism cash-out penalties (System Buy Price), and size reserve capacity cushions before gate closure.

Built for the **Full Stack SWE Challenge — January 2026 Elexon Assessment**.

---

## Live Demo & Deployment
- **Frontend (Vercel)**: `https://<your-vercel-deployment-url>.vercel.app` *(Update with your link)*
- **Backend API (Render / Heroku)**: `https://<your-backend-deployment-url>.onrender.com` *(Update with your link)*
- **Walkthrough Video (Unlisted YouTube)**: `https://youtu.be/<your-unlisted-video-id>` *(Update with your link)*

### Video Structure & Timestamps (Max 10 Minutes Total)
Per the challenge requirements, the evaluation starts with the video. Reviewers can jump directly to each section:
- **`00:00 – 04:45` | Part 1: Client Product Pitch (Day-Ahead Trading Desk)**
  - Problem setting: Renewable intermittency and Elexon BMRS cash-out penalty risks.
  - Day-Ahead D-1 gate closure filtering (configurable cutoff hour via slider / direct numeric input).
  - Outturn vs. Day-Ahead forecast reconciliation across 48 half-hour settlement periods.
  - Synchronized period filtering (All 48 SPs, Evening Peak Triad 16:00–20:00 GMT, Off-Peak, Custom SP range).
  - Commercial Imbalance Risk Simulator (cleared wholesale price vs. SBP penalty spread).
  - 48-period Settlement Audit Ledger with one-click CSV export.
- **`04:45 – 09:30` | Part 2: Technical Architecture & Code Review (Tech Lead)**
  - Monorepo architecture: React 18 + Vite frontend and Python Flask + Gunicorn backend.
  - Elexon BMRS domain logic: strict `publishTime <= cutoff on D-1` matching and XX:30 half-hour fallback mapping.
  - Two-layer caching strategy: persistent Docker disk cache (`cache/*.json`) + startup in-memory indexing for sub-50ms API response times.
  - Backend request validation: HTTP 400 for invalid cutoff hours (0–23) and date formats; HTTP 404 for missing dates.
  - Automated unit test suite with `pytest` (health checks, validation errors, and MAE/Bias/P90 arithmetic).
  - Containerization with multi-stage Docker builds and `docker-compose.yml`.

---

## 1. Domain Background & Problem Setting

In Great Britain's wholesale electricity market:
1. **Day-Ahead Commitments**: Energy suppliers must submit Physical Notifications and purchase electricity in the day-ahead auctions (clearing around 11:00–12:00 GMT on D-1) to cover forecast consumer demand.
2. **Renewable Intermittency**: Wind power is weather-dependent. To decide how much baseload or flexible thermal generation to contract, traders subtract expected wind generation from consumer demand.
3. **Balancing Mechanism Penalties**: If wind generation underperforms compared to day-ahead bids, the supplier enters an energy deficit. Elexon BSC rules force the deficit to be settled at the punitive **System Buy Price (SBP)**, which can exceed £300–£400/MWh during peak demand hours.

### Solution Delivered
This cockpit automates the audit and reconciliation of official **Elexon BMRS** data for January 2026:
- **`FUELHH/stream`**: National half-hourly wind generation actual outturn.
- **`WINDFOR/stream`**: National wind generation forecasts published at various lead times.
- **Strict Gate Closure Filtering**: Filters all forecasts published strictly prior to the selected Day-Ahead cutoff hour (e.g. 12:00 GMT on D-1).

---

## 2. System Architecture & Features

```
┌─────────────────────────────────────────────────────────────┐
│               Frontend: React 18 + Vite SPA                 │
│  - Recharts Outturn vs Day-Ahead Forecast Visualization     │
│  - Forecast Residuals & Imbalance Spread Breakdown          │
│  - Commercial Imbalance Financial Exposure Simulator        │
│  - 48 Half-Hourly Settlement Audit Reconciliation Ledger    │
│  - Global Synchronized Period Filter (All/Peak/Custom SPs)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON
┌──────────────────────────────▼──────────────────────────────┐
│                  Backend: Python / Flask                    │
│  - Gunicorn Multi-Worker WSGI Server                        │
│  - In-Memory High-Speed Indexing & Caching (sub-50ms)        │
│  - Gate Closure Validation (f_publish <= cutoff on D-1)     │
│  - Quantitative Error Engine (MAE, RMSE, MBE, MAPE, P90)    │
│  - Input Validation & Comprehensive Pytest Test Suite       │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               │    Local Elexon BMRS Cache    │
               │  - actuals_jan_2026.json      │
               │  - forecasts_jan_2026.json    │
               └───────────────────────────────┘
```

### Core Features
- **Accurate D-1 Gate Closure**: Configurable gate closure cutoff hour (00:00 to 23:00 GMT) via slider or direct numeric input.
- **Synchronized Global Range Filter**: Filter both visual charts and the audit ledger simultaneously by preset (All 48 SPs, Evening Peak Triad 16:00–20:00 GMT, Off-Peak) or by typing custom Settlement Period ranges (e.g. SP 10 to SP 30).
- **Interactive Risk Simulator**: Real-time balancing penalty simulation with dual sliders and manual numeric inputs for EPEX Day-Ahead Wholesale (£40–£150/MWh) and Elexon System Buy Price (£100–£450/MWh).
- **Settlement Ledger with CSV Export**: Complete reconciliation table showing target timestamps, outturn, forecast, deviation, and Elexon publish timestamps with one-click CSV export.
- **Tactile, Resilient UI**: High-density institutional layout using the `Outfit` typeface, JetBrains Mono tabular numbers, responsive safe-area padding, and error boundary isolation.

---

## 3. Directory & File Structure

```
.
├── docker-compose.yml              # Multi-container orchestration (Frontend + Backend)
├── README.md                       # Comprehensive project documentation
├── Backend/
│   ├── Dockerfile                  # Production Python 3.11-slim container with Gunicorn
│   ├── .dockerignore               # Ignores venv, cache bytecode, and test artifacts
│   ├── app.py                      # Flask REST API endpoints and input validation
│   ├── elexon_service.py           # In-memory indexed forecast reconciliation & metrics engine
│   ├── fetch_january_2026.py       # Elexon BMRS API live stream fetcher script
│   ├── test_app.py                 # Automated unit tests (API endpoints, inputs, math)
│   ├── requirements.txt            # Python dependencies (Flask, Gunicorn, Requests, Pytest)
│   └── cache/
│       ├── actuals_jan_2026.json   # Cached Elexon FUELHH wind actuals (Jan 2026)
│       └── forecasts_jan_2026.json # Cached Elexon WINDFOR forecasts (Dec 2025 – Jan 2026)
│
└── Frontend/
    ├── Dockerfile                  # Multi-stage build + Nginx production reverse proxy
    ├── .dockerignore               # Ignores node_modules, build artifacts, env files
    ├── package.json                # React, Vite, Lucide-React, Recharts, TailwindCSS
    ├── pnpm-lock.yaml              # Lockfile for reproducible dependency resolution
    ├── vite.config.js              # Vite bundler configuration with vendor chunk splitting
    ├── tailwind.config.js          # Tailored typography and semantic color tokens
    ├── index.html                  # HTML5 entry with Google Fonts (Outfit, JetBrains Mono)
    └── src/
        ├── App.jsx                 # Global state orchestration & intersection navigation
        ├── api.js                  # Fetch client with timeout and abort handling
        ├── index.css               # Base styles, slider styling, tactile animation curves
        └── components/
            ├── Header.jsx          # Header with live status, snap view, and section tabs
            ├── SidePanel.jsx       # Gate closure cutoff controls & verification scorecards
            ├── PeriodFilterBar.jsx # Shared settlement period filter bar with custom range
            ├── GenerationChartSection.jsx # Outturn vs Forecast Recharts view
            ├── ResidualsChartSection.jsx  # Deviation spread surplus/deficit bar chart
            ├── SimulatorSection.jsx       # Commercial financial imbalance risk simulator
            ├── AuditSection.jsx           # 48 half-hour settlement reconciliation ledger
            ├── OperationalAdvisory.jsx    # Sticky constant-height dispatch recommendation
            └── ErrorBoundary.jsx          # React error boundary component
```

---

## 4. How to Start the Application

### Option A: Running with Docker (Recommended)
Prerequisites: [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

From the repository root:
```bash
# Build and start both Backend and Frontend
docker compose up --build
```
- **Frontend Dashboard**: Open [http://localhost](http://localhost) in your browser.
- **Backend API**: Accessible at [http://localhost:5000/api/health](http://localhost:5000/api/health).

To shut down:
```bash
docker compose down
```

---

### Option B: Running Locally (Development Mode)

#### 1. Backend Setup (Python)
Prerequisites: Python 3.10+
```bash
cd Backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run automated tests
pytest test_app.py

# Start Flask development server (port 5000)
python app.py
```

#### 2. Frontend Setup (React)
Prerequisites: Node.js 18+ and `pnpm` (recommended, matching `pnpm-lock.yaml`) or `npm`.
```bash
cd Frontend

# Install dependencies using pnpm (or npm install)
pnpm install

# Start Vite development server (port 5173)
pnpm dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 5. Verification & Testing

### Backend Unit Tests
Execute the comprehensive Pytest suite:
```bash
cd Backend
pytest test_app.py -v
```
**Test Coverage**:
- `test_health_endpoint`: Asserts service health and pre-warmed cache flag.
- `test_forecast_analysis_endpoint`: Validates payload schema, 48 settlement periods, and root fields.
- `test_forecast_analysis_invalid_cutoff`: Verifies `400 Bad Request` on non-numeric or out-of-range cutoff hours (`-1`, `24`, `"noon"`).
- `test_forecast_analysis_invalid_date`: Verifies `400 Bad Request` on malformed date strings and `404 Not Found` for dates outside January 2026.
- `test_metric_calculations`: Validates exact mathematical formulas for MAE, RMSE, and MBE (Bias).

### Frontend Code Quality
```bash
cd Frontend
pnpm build    # Compiles production bundle with zero errors
```

---

## 6. AI Tools Disclosure

As explicitly permitted and requested in Section 2 of the challenge instructions:
* AI coding assistants were utilized to accelerate development, assist with rapid component scaffolding, optimize Recharts configurations, and refine UI micro-interactions.
* All domain calculations (Elexon BMRS half-hour settlement periods, D-1 gate closure logic, and Cash-Out penalty spread arithmetic) were carefully reviewed, verified, and validated against official Elexon documentation.
