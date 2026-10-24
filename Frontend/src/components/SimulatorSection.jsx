export default function SimulatorSection({
  dayAheadPrice,
  onDayAheadPriceChange,
  cashoutPrice,
  onCashoutPriceChange,
  financialExposure,
  p90BufferMW
}) {
  const peakConcentrationPct = Math.round(
    (financialExposure.peakLoss / (financialExposure.totalLoss || 1)) * 100
  );

  function handleDayAheadInput(e) {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onDayAheadPriceChange(Math.min(150, Math.max(40, Math.round(val))));
    }
  }

  function handleCashoutInput(e) {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onCashoutPriceChange(Math.min(450, Math.max(100, Math.round(val))));
    }
  }

  return (
    <section
      id="financial-simulator"
      className="snap-start w-full h-[calc(100vh-105px)] min-h-[580px] p-6 bg-white flex flex-col justify-between border-b border-slate-200"
    >
      {/* Header bar */}
      <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900">
            Commercial Imbalance Financial Risk Simulator
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quantifies balancing cash-out penalty exposure incurred when actual wind generation deviates below day-ahead commitments.
            Spread formula: (Deficit MW × 0.5h) × (SBP − DayAhead).
          </p>
        </div>
      </div>

      {/* Main Controls & Impact Cards (Expands in Viewport) */}
      <div className="flex-1 my-4 flex flex-col justify-center space-y-6">
        {/* Sliders Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="day-ahead-price-input" className="text-xs font-bold uppercase tracking-wider text-slate-700 cursor-pointer">
                Day-Ahead Wholesale Price (EPEX Spot / Nord Pool)
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xs font-mono font-bold text-slate-500">£</span>
                <input
                  id="day-ahead-price-input"
                  type="number"
                  min="40"
                  max="150"
                  value={dayAheadPrice}
                  onChange={handleDayAheadInput}
                  aria-label="Day Ahead Wholesale Price in Pounds per Megawatt Hour"
                  className="w-16 text-center text-sm font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs appearance-none"
                />
                <span className="text-xs font-mono font-medium text-slate-500">/ MWh</span>
              </div>
            </div>
            <input
              type="range"
              min="40"
              max="150"
              value={dayAheadPrice}
              onChange={(e) => onDayAheadPriceChange(Number(e.target.value))}
              aria-label="Day Ahead Wholesale Price slider"
              aria-valuemin={40}
              aria-valuemax={150}
              aria-valuenow={dayAheadPrice}
              aria-valuetext={`£${dayAheadPrice} per Megawatt hour`}
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
              <span>£40 / MWh</span>
              <span className="text-slate-600 font-semibold">Benchmark contract</span>
              <span>£150 / MWh</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="cashout-price-input" className="text-xs font-bold uppercase tracking-wider text-slate-700 cursor-pointer">
                System Buy Price (Balancing Cash-Out Penalty Rate)
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xs font-mono font-bold text-amber-900">£</span>
                <input
                  id="cashout-price-input"
                  type="number"
                  min="100"
                  max="450"
                  value={cashoutPrice}
                  onChange={handleCashoutInput}
                  aria-label="System Buy Price in Pounds per Megawatt Hour"
                  className="w-16 text-center text-sm font-mono font-bold text-amber-900 bg-amber-50/80 border border-amber-300 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-amber-900 shadow-2xs appearance-none"
                />
                <span className="text-xs font-mono font-medium text-amber-900">/ MWh</span>
              </div>
            </div>
            <input
              type="range"
              min="100"
              max="450"
              value={cashoutPrice}
              onChange={(e) => onCashoutPriceChange(Number(e.target.value))}
              aria-label="Balancing Cashout Penalty Price slider"
              aria-valuemin={100}
              aria-valuemax={450}
              aria-valuenow={cashoutPrice}
              aria-valuetext={`£${cashoutPrice} per Megawatt hour balancing penalty`}
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
              <span>£100 / MWh</span>
              <span className="text-amber-800 font-semibold">Balancing penalty rate</span>
              <span>£450 / MWh</span>
            </div>
          </div>
        </div>

        {/* 3 Impact Scorecards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500 block">
                Total Estimated Daily Exposure
              </span>
              <div className="text-3xl md:text-4xl font-extrabold text-slate-900 font-mono tabular-nums mt-3">
                £{Math.round(financialExposure.totalLoss).toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Across all {financialExposure.deficitCount} half-hours with wind generation deficit.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Average Deficit Rate:</span>
              <span className="font-mono font-bold">
                £{Math.round((financialExposure.totalLoss || 0) / (financialExposure.deficitCount || 1)).toLocaleString()} / SP
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500 block">
                Peak Demand Hours Exposure
              </span>
              <div className="text-3xl md:text-4xl font-extrabold text-amber-700 font-mono tabular-nums mt-3">
                £{Math.round(financialExposure.peakLoss).toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Concentrated in Settlement Periods 33–40 (16:00–20:00 GMT peak triad).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Peak Concentration:</span>
              <span className="font-mono font-bold text-amber-700">
                {peakConcentrationPct}% of daily exposure
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500 block">
                Recommended Reserve Volume
              </span>
              <div className="text-3xl md:text-4xl font-extrabold text-emerald-700 font-mono tabular-nums mt-3">
                +{p90BufferMW || 0} <span className="text-xl font-normal text-slate-500">MW</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                P90 headroom buffer to hedge against 90% of observed downside deviations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Hedging Ratio:</span>
              <span className="font-mono font-bold text-emerald-700">90% Confidence</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer disclaimer */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 shrink-0 font-mono">
        <span>Formula: (Deficit Volume MW × 0.5h) × (System Buy Price − Day-Ahead Price)</span>
        <span>Elexon Balancing Mechanism Settlement Code (BSC) Rules</span>
      </div>
    </section>
  );
}
