import { ShieldCheck, TrendingUp } from 'lucide-react';

// Always renders a fixed-height strip — shows skeleton if no recommendation yet
export default function OperationalAdvisory({ recommendation, bufferMW, biasMW, loading }) {
  const isHighRisk = (biasMW ?? 0) > 0;

  // Skeleton state: loading or no data yet
  const isReady = !loading && !!recommendation;

  return (
    <div
      className="w-full border-b border-slate-200 bg-slate-50"
      style={{ minHeight: '46px' }}
      aria-live="polite"
      aria-atomic="true"
    >
      {isReady ? (
        <div className="w-full px-4 md:px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-entrance">
          {/* Left: Indicator dot + Advisory text */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="shrink-0 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={`pulse-indicator inline-flex h-2 w-2 rounded-full ${isHighRisk ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              </span>
              {isHighRisk ? (
                <TrendingUp className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
            </div>

            <p className="text-xs md:text-sm text-slate-700 font-medium leading-snug truncate md:overflow-visible md:whitespace-normal">
              <span className={`font-semibold mr-1.5 ${isHighRisk ? 'text-amber-700' : 'text-slate-800'}`}>
                {isHighRisk ? 'Action Required:' : 'Advisory:'}
              </span>
              {recommendation}
            </p>
          </div>

          {/* Right: Reserve buffer callout */}
          {bufferMW != null && (
            <div className="flex items-center gap-1.5 text-xs font-mono shrink-0 text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Recommended Reserve: <strong>+{bufferMW} MW</strong></span>
            </div>
          )}
        </div>
      ) : (
        // Constant-height skeleton — no layout shift
        <div className="w-full px-4 md:px-6 py-2.5 flex items-center gap-4 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-slate-200 shrink-0" />
          <div className="h-3 bg-slate-200 rounded w-1/2 max-w-xs" />
          <div className="h-3 bg-slate-200 rounded w-24 ml-auto" />
        </div>
      )}
    </div>
  );
}
