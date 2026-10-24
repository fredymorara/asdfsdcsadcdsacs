import { Calendar, Clock, TrendingUp, TrendingDown, ShieldCheck, X } from 'lucide-react';

export default function SidePanel({
  isOpen,
  onClose,
  selectedDate,
  onDateChange,
  availableDates = [],
  cutoffHour,
  onCutoffHourChange,
  metrics = {}
}) {
  if (!isOpen) return null;

  const isOverForecasting = (metrics?.bias_mw ?? 0) > 0;

  // Validate and clamp typed input (0–23)
  function handleCutoffInput(e) {
    const raw = e.target.value;
    if (raw === '') return; // allow clearing while typing
    const num = parseInt(raw, 10);
    if (!isNaN(num)) {
      onCutoffHourChange(Math.min(23, Math.max(0, num)));
    }
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden"
        aria-hidden="true"
      />

      {/* Main Drawer / Docked Sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-40 w-80 md:relative md:inset-auto md:w-80 shrink-0 h-full overflow-y-auto bg-white border-r border-slate-200 p-5 flex flex-col justify-between gap-6 shadow-2xl md:shadow-none"
        aria-label="Settlement parameters and operations sidebar"
      >
        <div className="space-y-6">
          {/* Panel Header */}
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Operations &amp; Parameters
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400">48 Half-Hours</span>
              <button
                onClick={onClose}
                className="btn-tactile p-1 text-slate-400 hover:text-slate-700 md:hidden rounded hover:bg-slate-100"
                aria-label="Close parameters panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 1. Delivery Date Selector */}
          <div>
            <label
              htmlFor="settlement-day-select"
              className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-700" aria-hidden="true" />
              Settlement Day
            </label>
            <select
              id="settlement-day-select"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer shadow-2xs"
            >
              {availableDates.length > 0 ? (
                availableDates.map((d) => (
                  <option key={d} value={d}>
                    {d} {d === '2026-01-05' ? '— High Deficit Day' : ''}
                  </option>
                ))
              ) : (
                <option value={selectedDate}>{selectedDate}</option>
              )}
            </select>
          </div>

          {/* 2. Gate Closure Cutoff — Slider + Number Input */}
          <div>
            {/* Label row + number input on the right */}
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <label
                htmlFor="cutoff-hour-input"
                className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-slate-700" aria-hidden="true" />
                Day-Ahead Cutoff (D-1)
              </label>

              {/* Inline number field — type or spin */}
              <div className="flex items-center gap-1 shrink-0">
                <input
                  id="cutoff-hour-input"
                  type="number"
                  min="0"
                  max="23"
                  value={cutoffHour}
                  onChange={handleCutoffInput}
                  className="w-12 text-center text-xs font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-md px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs appearance-none"
                  aria-label="Day-Ahead Gate Closure Hour (0–23)"
                />
                <span className="text-xs font-mono font-semibold text-slate-500">:00 GMT</span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="23"
              value={cutoffHour}
              onChange={(e) => onCutoffHourChange(Number(e.target.value))}
              aria-label="Day-Ahead Gate Closure Cutoff Hour slider"
              aria-valuemin={0}
              aria-valuemax={23}
              aria-valuenow={cutoffHour}
              aria-valuetext={`${cutoffHour.toString().padStart(2, '0')}:00 GMT Gate Closure`}
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
              <span>00:00</span>
              <span className="text-slate-600 font-semibold">12:00 Gate</span>
              <span>23:00</span>
            </div>
          </div>

          {/* 3. Verification Metrics — dark-surface cards */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Verification Metrics
            </span>

            {/* MAE */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3.5 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Mean Absolute Error (MAE)
              </span>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="text-xl font-bold font-mono tabular-nums text-white">
                  {metrics?.mae_mw != null ? metrics.mae_mw.toLocaleString() : '--'}
                </span>
                <span className="text-xs font-semibold text-slate-400">MW</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Average half-hour deviation</p>
            </div>

            {/* Bias */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3.5 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Forecast Bias (MBE)
              </span>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className={`text-xl font-bold font-mono tabular-nums ${isOverForecasting ? 'text-amber-400' : 'text-white'}`}>
                  {metrics?.bias_mw != null
                    ? (metrics.bias_mw > 0 ? `+${metrics.bias_mw}` : metrics.bias_mw)
                    : '--'}
                </span>
                <span className="text-xs font-semibold text-slate-400">MW</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium mt-1">
                {isOverForecasting ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" aria-hidden="true" /> Over-forecast Deficit Risk
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" aria-hidden="true" /> Under-forecast Spill Risk
                  </span>
                )}
              </div>
            </div>

            {/* P90 Buffer */}
            <div className="bg-slate-900 border border-emerald-800/60 rounded-xl p-3.5 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-emerald-500 block">
                P90 Safety Cushion Reserve
              </span>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="text-xl font-bold font-mono tabular-nums text-emerald-400">
                  +{metrics?.p90_risk_buffer_mw != null ? metrics.p90_risk_buffer_mw.toLocaleString() : '--'}
                </span>
                <span className="text-xs font-semibold text-emerald-600">MW</span>
              </div>
              <p className="text-[11px] text-emerald-600 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                90% worst-case coverage
              </p>
            </div>

            {/* Reconciled / MAPE */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Reconciled Periods</span>
                <span className="text-sm font-bold font-mono text-white">
                  {metrics?.evaluated_periods ?? 0} / 48 SPs
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Relative MAPE</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {metrics?.mape_percent ?? '--'}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
          Elexon BMRS Live Stream • 48 SP Data Pipeline
        </div>
      </aside>
    </>
  );
}
