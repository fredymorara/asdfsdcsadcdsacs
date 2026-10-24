import { Download } from 'lucide-react';
import PeriodFilterBar from './PeriodFilterBar';

export default function AuditSection({
  chartData = [],
  onExportCSV,
  cutoffHour,
  periodFilter,
  onPeriodFilterChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  totalPeriods = 48,
}) {
  return (
    <section
      id="settlement-ledger"
      className="snap-start w-full h-[calc(100vh-105px)] min-h-[580px] p-6 bg-white flex flex-col gap-0 justify-between"
      aria-labelledby="audit-ledger-heading"
    >
      {/* Header */}
      <div className="pb-4 border-b border-slate-100 flex flex-col gap-3 shrink-0">
        {/* Title + Export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 id="audit-ledger-heading" className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900">
              Settlement Period Audit Reconciliation (48 Half-Hours)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Verification that all evaluated forecasts were published strictly prior to {cutoffHour.toString().padStart(2, '0')}:00 GMT on D-1.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Export */}
            <button
              onClick={onExportCSV}
              className="btn-tactile flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none min-h-[32px]"
              aria-label="Export audit ledger as CSV"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Global Period Filter Bar */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[11px] text-slate-500 font-semibold">Filter:</span>
          <PeriodFilterBar
            periodFilter={periodFilter}
            onPeriodFilterChange={onPeriodFilterChange}
            customFrom={customFrom}
            customTo={customTo}
            onCustomFromChange={onCustomFromChange}
            onCustomToChange={onCustomToChange}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 my-4 border border-slate-200 rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1" role="region" aria-label="Settlement reconciliation log">
          <table className="w-full text-left text-xs font-mono" aria-label="Settlement reconciliation log">
            <caption className="sr-only">
              Elexon BMRS half-hourly settlement audit reconciliation log
            </caption>
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider sticky top-0 border-b border-slate-200 z-10 shadow-2xs">
              <tr>
                <th scope="col" className="py-3 px-4 font-semibold">Period</th>
                <th scope="col" className="py-3 px-4 font-semibold">Target Time (GMT)</th>
                <th scope="col" className="py-3 px-4 font-semibold text-right">Actual Outturn</th>
                <th scope="col" className="py-3 px-4 font-semibold text-right">Day-Ahead Forecast</th>
                <th scope="col" className="py-3 px-4 font-semibold text-right">Deviation (Error)</th>
                <th scope="col" className="py-3 px-4 font-semibold text-right">Publish Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {chartData && chartData.length > 0 ? (
                chartData.map((row) => {
                  const errorVal = Number(row.errorMW) || 0;
                  const isDeficit = errorVal > 0;
                  const actualVal = Number(row.actualMW) || 0;
                  const forecastVal = Number(row.forecastMW) || 0;

                  return (
                    <tr key={row.startTime} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        SP {row.settlementPeriod ?? '--'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {row.timeLabel ?? row.startTime ?? '--'}
                      </td>
                      <td className="py-2.5 px-4 text-right text-emerald-800 font-semibold tabular-nums">
                        {actualVal.toLocaleString()} MW
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-800 font-semibold tabular-nums">
                        {forecastVal.toLocaleString()} MW
                      </td>
                      <td className={`py-2.5 px-4 text-right font-bold tabular-nums ${isDeficit ? 'text-amber-800' : 'text-slate-800'}`}>
                        {errorVal > 0 ? `+${errorVal.toLocaleString()}` : errorVal.toLocaleString()} MW
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-400">
                        {row.publishTime ?? '--'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-medium">
                      No periods in the selected range.
                    </p>
                    <button
                      onClick={() => onPeriodFilterChange?.('all')}
                      className="btn-tactile mt-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded border border-slate-300 cursor-pointer"
                    >
                      Reset Filter to All
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 shrink-0 font-mono">
        <span>
          Showing {chartData.length} of {totalPeriods} half-hourly settlement periods
          {periodFilter === 'custom' && ` · Custom SP ${customFrom}–${customTo}`}
          {periodFilter === 'peak' && ' · Peak Hours (16:00–20:00 GMT)'}
          {periodFilter === 'offpeak' && ' · Off-Peak Hours'}
        </span>
        <span>Elexon BMRS Open Stream Dataset (FUELHH &amp; WINDFOR)</span>
      </div>
    </section>
  );
}
