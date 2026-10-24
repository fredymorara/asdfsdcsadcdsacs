import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Cell
} from 'recharts';
import PeriodFilterBar from './PeriodFilterBar';

export default function ResidualsChartSection({
  chartData = [],
  periodFilter,
  onPeriodFilterChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
}) {
  const hasData = chartData && chartData.length > 0;

  return (
    <section
      id="residuals-chart"
      className="snap-start w-full h-[calc(100vh-105px)] min-h-[580px] p-6 bg-white flex flex-col justify-between border-b border-slate-200"
      aria-labelledby="residuals-heading"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-slate-100 gap-3 shrink-0">
        <div>
          <h2 id="residuals-heading" className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900">
            Forecast Deviation Residuals &amp; Imbalance Spread
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Bars &gt; 0 indicate wind over-forecasting (volume deficit risk). Bars &lt; 0 indicate under-forecasting (curtailment/spill).
          </p>
        </div>

        {/* Legend + Filter */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-600 inline-block" />
              <span className="text-slate-700">Deficit (&gt; 0 MW)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-700 inline-block" />
              <span className="text-slate-700">Surplus (&lt; 0 MW)</span>
            </div>
          </div>

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

      {/* Chart */}
      <div className="flex-1 w-full my-4 min-h-[380px] flex items-center justify-center">
        {!hasData ? (
          <div className="text-center p-8 text-slate-400 font-mono text-xs">
            No residuals data available to display.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 16, right: 28, left: 16, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="timeLabel"
                stroke="#94a3b8"
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval={2}
                tickLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(v) => `${v} MW`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                  color: '#0f172a',
                  fontSize: '12px',
                  padding: '10px 14px'
                }}
                formatter={(value) => [`${Number(value || 0).toLocaleString()} MW`, 'Forecast Deviation']}
              />
              <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1.5} />
              <Bar dataKey="errorMW" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={(entry.errorMW || 0) > 0 ? '#b45309' : '#047857'}
                    opacity={0.9}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 shrink-0 font-mono">
        <span>Scroll down to simulate financial penalty exposure &darr;</span>
        <span>Reconciled against Elexon BMRS settlement rules</span>
      </div>
    </section>
  );
}
