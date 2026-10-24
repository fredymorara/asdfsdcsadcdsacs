export function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm animate-pulse flex flex-col justify-between h-[126px]"
        >
          <div className="h-3 w-28 bg-slate-200 rounded"></div>
          <div className="h-8 w-36 bg-slate-200 rounded my-2"></div>
          <div className="h-3 w-44 bg-slate-100 rounded"></div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm animate-pulse">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="space-y-2">
            <div className="h-4 w-64 bg-slate-200 rounded"></div>
            <div className="h-3 w-96 bg-slate-100 rounded"></div>
          </div>
          <div className="h-4 w-48 bg-slate-100 rounded"></div>
        </div>
        <div className="h-[360px] w-full mt-4 flex items-center justify-center bg-slate-50/50 rounded-lg">
          <div className="text-xs font-mono text-slate-400">Loading settlement outturns...</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm animate-pulse">
        <div className="space-y-2 pb-3 border-b border-slate-100">
          <div className="h-4 w-52 bg-slate-200 rounded"></div>
          <div className="h-3 w-80 bg-slate-100 rounded"></div>
        </div>
        <div className="h-[200px] w-full mt-4 flex items-center justify-center bg-slate-50/50 rounded-lg">
          <div className="text-xs font-mono text-slate-400">Calculating deviation residuals...</div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm animate-pulse space-y-4">
      <div className="h-5 w-60 bg-slate-200 rounded"></div>
      <div className="h-3 w-96 bg-slate-100 rounded mb-4"></div>
      <div className="space-y-2">
        {[...Array(8)].map((_, idx) => (
          <div key={idx} className="h-9 w-full bg-slate-50 rounded border border-slate-100"></div>
        ))}
      </div>
    </div>
  );
}
