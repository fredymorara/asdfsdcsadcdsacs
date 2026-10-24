import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import PeriodFilterBar from './PeriodFilterBar';

export default function GenerationChartSection({
  chartData = [],
  cutoffHour,
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
      id="generation-chart"
      className="snap-start w-full h-[calc(100vh-105px)] min-h-[580px] p-6 bg-white flex flex-col justify-between border-b border-slate-200"
      aria-labelledby="wind-outturn-heading"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-slate-100 gap-3 shrink-0">
        <div>
          <h2 id="wind-outturn-heading" className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900">
            Wind Generation: Actual Outturn vs Day-Ahead Forecast
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Half-hourly outturn against latest forecast locked before {cutoffHour.toString().padStart(2, '0')}:00 on D-1.
          </p>
        </div>

        {/* Legend + Filter */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 inline-block" />
              <span className="text-slate-700">Actual Outturn</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-0.5 inline-block border-t-2 border-dashed border-amber-600" />
              <span className="text-slate-700">Day-Ahead Forecast</span>
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
            No settlement periods available for the selected filter.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 16, right: 28, left: 16, bottom: 8 }}>
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
                tickFormatter={(v) => `${(v / 1000).toFixed(1)}k MW`}
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
                formatter={(value, name) => [
                  `${Number(value || 0).toLocaleString()} MW`,
                  name === 'actualMW' ? 'Actual Wind Outturn' : 'Day-Ahead Forecast'
                ]}
                labelFormatter={(label) => `Settlement Time: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="actualMW"
                name="actualMW"
                stroke="#047857"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#047857', stroke: '#ffffff', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="forecastMW"
                name="forecastMW"
                stroke="#b45309"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 6, fill: '#b45309', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 shrink-0 font-mono">
        <span>Scroll down to inspect forecast deviation residuals &darr;</span>
        <span>Resolution: 30-minute settlement periods (SPs 1–48)</span>
      </div>
    </section>
  );
}
