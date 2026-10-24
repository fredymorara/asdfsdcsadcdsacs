import { Flame } from 'lucide-react';

const PRESETS = [
  { value: 'all', label: 'All 48 SPs' },
  { value: 'peak', label: 'Peak (16–20h)', icon: true },
  { value: 'offpeak', label: 'Off-Peak' },
  { value: 'custom', label: 'Custom Range' },
];

/**
 * Shared period filter bar used by all chart sections and the audit table.
 * All state lives in App.jsx — this is purely presentational.
 */
export default function PeriodFilterBar({
  periodFilter,
  onPeriodFilterChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
}) {
  function handleFromChange(e) {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v)) onCustomFromChange(Math.min(Math.max(1, v), customTo));
  }

  function handleToChange(e) {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v)) onCustomToChange(Math.min(48, Math.max(customFrom, v)));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Preset pill group */}
      <div
        className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5"
        role="group"
        aria-label="Settlement period filter"
      >
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => onPeriodFilterChange(p.value)}
            className={`btn-tactile flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              periodFilter === p.value
                ? p.value === 'peak'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                  : 'bg-white text-slate-900 border border-slate-200 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            aria-pressed={periodFilter === p.value}
          >
            {p.icon && <Flame className="w-3 h-3 text-amber-500 shrink-0" aria-hidden="true" />}
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom SP range inputs — shown only when Custom is active */}
      {periodFilter === 'custom' && (
        <div className="flex items-center gap-1.5" role="group" aria-label="Custom SP range">
          <span className="text-[11px] text-slate-500 font-semibold">SP</span>
          <input
            type="number"
            min="1"
            max={customTo}
            value={customFrom}
            onChange={handleFromChange}
            aria-label="Custom range start settlement period"
            className="w-14 text-center text-[11px] font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-md px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
          />
          <span className="text-[11px] text-slate-400 font-medium">to</span>
          <input
            type="number"
            min={customFrom}
            max="48"
            value={customTo}
            onChange={handleToChange}
            aria-label="Custom range end settlement period"
            className="w-14 text-center text-[11px] font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-md px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
          />
          <span className="text-[11px] text-slate-500 font-medium">
            ({customTo - customFrom + 1} SP{customTo - customFrom + 1 !== 1 ? 's' : ''})
          </span>
        </div>
      )}
    </div>
  );
}
