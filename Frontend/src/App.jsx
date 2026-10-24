import { useState, useEffect, useMemo, useRef } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { fetchForecastAnalysis } from './api';
import Header from './components/Header';
import OperationalAdvisory from './components/OperationalAdvisory';
import SidePanel from './components/SidePanel';
import GenerationChartSection from './components/GenerationChartSection';
import ResidualsChartSection from './components/ResidualsChartSection';
import SimulatorSection from './components/SimulatorSection';
import AuditSection from './components/AuditSection';
import ErrorBoundary from './components/ErrorBoundary';
import { ChartSkeleton } from './components/SkeletonLoader';

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Layout & Viewport Navigation State
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [isSnapEnabled, setIsSnapEnabled] = useState(true);
  const [activeSection, setActiveSection] = useState('generation-chart');

  // Filters & Parameters
  const [selectedDate, setSelectedDate] = useState('2026-01-05');
  const [cutoffHour, setCutoffHour] = useState(12);
  const [periodFilter, setPeriodFilter] = useState('all'); // 'all', 'peak', 'offpeak', 'custom'
  const [customFrom, setCustomFrom] = useState(1);   // SP 1–48
  const [customTo, setCustomTo] = useState(48);       // SP 1–48

  // Financial Simulator Parameters
  const [dayAheadPrice, setDayAheadPrice] = useState(75); // £/MWh
  const [cashoutPrice, setCashoutPrice] = useState(165);   // £/MWh penalty

  const mainScrollRef = useRef(null);

  // Fetch forecast data
  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchForecastAnalysis(selectedDate, cutoffHour, controller.signal);
        if (!ignore) {
          setData(res);
        }
      } catch (err) {
        if (!ignore && err.name !== 'AbortError') {
          setError(err.message || 'Failed to connect to forecast backend service at http://127.0.0.1:5000');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [selectedDate, cutoffHour, reloadKey]);

  const rawChartData = data?.chartData;

  // Filter periods — shared across all charts and the audit table
  const filteredChartData = useMemo(() => {
    if (!rawChartData) return [];
    if (periodFilter === 'peak') {
      return rawChartData.filter(d => d.settlementPeriod >= 33 && d.settlementPeriod <= 40);
    }
    if (periodFilter === 'offpeak') {
      return rawChartData.filter(d => d.settlementPeriod < 33 || d.settlementPeriod > 40);
    }
    if (periodFilter === 'custom') {
      return rawChartData.filter(d => d.settlementPeriod >= customFrom && d.settlementPeriod <= customTo);
    }
    return rawChartData;
  }, [rawChartData, periodFilter, customFrom, customTo]);

  // Financial exposure calculation
  const financialExposure = useMemo(() => {
    if (!rawChartData) return { totalLoss: 0, peakLoss: 0, totalShortfallMWh: 0 };
    
    let totalLoss = 0;
    let peakLoss = 0;
    let totalShortfallMWh = 0;

    rawChartData.forEach(d => {
      const errorVal = Number(d.errorMW) || 0;
      if (errorVal > 0) {
        const shortfallMWh = errorVal * 0.5; // 30 mins = 0.5 hours
        const spread = Math.max(0, cashoutPrice - dayAheadPrice);
        const cost = shortfallMWh * spread;
        
        totalLoss += cost;
        totalShortfallMWh += shortfallMWh;
        if (d.settlementPeriod >= 33 && d.settlementPeriod <= 40) {
          peakLoss += cost;
        }
      }
    });

    return {
      totalLoss: Math.round(totalLoss),
      peakLoss: Math.round(peakLoss),
      totalShortfallMWh: Math.round(totalShortfallMWh)
    };
  }, [rawChartData, dayAheadPrice, cashoutPrice]);

  // Native IntersectionObserver for zero-overhead section tracking
  useEffect(() => {
    const rootEl = mainScrollRef.current;
    if (!rootEl) return;

    const sectionIds = ['generation-chart', 'residuals-chart', 'financial-simulator', 'settlement-ledger'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: rootEl,
        threshold: 0.5,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loading, data]);

  // Export to CSV
  const exportToCSV = () => {
    if (!rawChartData?.length) return;
    const headers = ["Settlement Period", "Target Time", "Actual MW", "Day-Ahead Forecast MW", "Error MW", "Publish Time"];
    const rows = rawChartData.map(d => [
      d.settlementPeriod,
      `"${d.startTime}"`,
      d.actualMW,
      d.forecastMW,
      d.errorMW,
      `"${d.publishTime}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `UK_Wind_Reconciliation_${selectedDate}_cutoff_${cutoffHour}h.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Smooth scroll to section
  const handleNavigateSection = (sectionId) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className="w-screen h-screen overflow-hidden flex flex-col bg-[#fafafa] text-slate-900 font-sans antialiased"
      style={{ height: '100dvh' }}
    >
      {/* Screen Reader Live Region for Dynamic Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {loading ? "Updating wind forecast data..." : `Displaying outturn data for ${selectedDate} with ${cutoffHour}:00 GMT cutoff.`}
      </div>

      {/* 1. Full-Bleed Top Header */}
      <Header
        isSidePanelOpen={isSidePanelOpen}
        onToggleSidePanel={() => setIsSidePanelOpen(!isSidePanelOpen)}
        isSnapEnabled={isSnapEnabled}
        onToggleSnap={() => setIsSnapEnabled(!isSnapEnabled)}
        onExportCSV={exportToCSV}
        hasData={Boolean(rawChartData?.length)}
        activeSection={activeSection}
        onNavigateSection={handleNavigateSection}
      />

      {/* 2. Always-present Operational Advisory strip (skeleton when loading) */}
      <OperationalAdvisory
        recommendation={data?.recommendation}
        bufferMW={data?.metrics?.p90_risk_buffer_mw}
        biasMW={data?.metrics?.bias_mw}
        loading={loading}
      />

      {/* 3. Error Banner */}
      {error && (
        <div className="w-full bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex items-center justify-between text-xs text-rose-800 shadow-2xs z-20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            onClick={() => setReloadKey(k => k + 1)}
            className="btn-tactile flex items-center gap-1 font-semibold text-rose-900 bg-rose-100 hover:bg-rose-200 px-2.5 py-1 rounded border border-rose-300 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Retry Connection
          </button>
        </div>
      )}

      {/* 4. Full Viewport Body: Left Side Panel + Right Main Snapping Canvas */}
      <div className="flex-1 w-full overflow-hidden flex flex-row">
        {/* Left Side Panel with Mobile Drawer Support */}
        <SidePanel
          isOpen={isSidePanelOpen}
          onClose={() => setIsSidePanelOpen(false)}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          availableDates={data?.availableDates || ['2026-01-05']}
          cutoffHour={cutoffHour}
          onCutoffHourChange={setCutoffHour}
          metrics={data?.metrics || {}}
        />

        {/* Right Main Snapping Canvas (Fills Viewport) */}
        <main
          ref={mainScrollRef}
          className={`flex-1 h-full overflow-y-auto ${
            isSnapEnabled ? 'snap-y snap-mandatory scroll-smooth' : 'snap-none scroll-smooth'
          }`}
        >
          {loading && !data ? (
            <div className="p-8">
              <ChartSkeleton />
            </div>
          ) : (
            <>
              {/* SECTION 1: Generation Outturn vs Day-Ahead Forecast */}
              <ErrorBoundary fallbackTitle="Unable to load Generation Outturn Chart">
                <GenerationChartSection
                  chartData={filteredChartData}
                  cutoffHour={cutoffHour}
                  periodFilter={periodFilter}
                  onPeriodFilterChange={setPeriodFilter}
                  customFrom={customFrom}
                  customTo={customTo}
                  onCustomFromChange={setCustomFrom}
                  onCustomToChange={setCustomTo}
                />
              </ErrorBoundary>

              {/* SECTION 2: Forecast Deviation Residuals Spread */}
              <ErrorBoundary fallbackTitle="Unable to load Deviation Residuals Chart">
                <ResidualsChartSection
                  chartData={filteredChartData}
                  periodFilter={periodFilter}
                  onPeriodFilterChange={setPeriodFilter}
                  customFrom={customFrom}
                  customTo={customTo}
                  onCustomFromChange={setCustomFrom}
                  onCustomToChange={setCustomTo}
                />
              </ErrorBoundary>

              {/* SECTION 3: Commercial Imbalance Risk Simulator */}
              <ErrorBoundary fallbackTitle="Unable to load Imbalance Risk Simulator">
                <SimulatorSection
                  dayAheadPrice={dayAheadPrice}
                  onDayAheadPriceChange={setDayAheadPrice}
                  cashoutPrice={cashoutPrice}
                  onCashoutPriceChange={setCashoutPrice}
                  financialExposure={financialExposure}
                  p90BufferMW={data?.metrics?.p90_risk_buffer_mw}
                />
              </ErrorBoundary>

              {/* SECTION 4: 48-Period Settlement Reconciliation Ledger */}
              <ErrorBoundary fallbackTitle="Unable to load Settlement Audit Ledger">
                <AuditSection
                  chartData={filteredChartData}
                  onExportCSV={exportToCSV}
                  cutoffHour={cutoffHour}
                  periodFilter={periodFilter}
                  onPeriodFilterChange={setPeriodFilter}
                  customFrom={customFrom}
                  customTo={customTo}
                  onCustomFromChange={setCustomFrom}
                  onCustomToChange={setCustomTo}
                  totalPeriods={rawChartData?.length || 0}
                />
              </ErrorBoundary>
            </>
          )}
        </main>
      </div>
    </div>
  );
}