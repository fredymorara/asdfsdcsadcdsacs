import { useState } from 'react';
import { Wind, Download, PanelLeftClose, PanelLeft, Compass, Check } from 'lucide-react';

export default function Header({
  isSidePanelOpen,
  onToggleSidePanel,
  isSnapEnabled,
  onToggleSnap,
  onExportCSV,
  hasData,
  activeSection,
  onNavigateSection
}) {
  const [isExporting, setIsExporting] = useState(false);

  const sections = [
    { id: 'generation-chart', label: 'Wind Outturn' },
    { id: 'residuals-chart', label: 'Error Spread' },
    { id: 'financial-simulator', label: 'Imbalance Risk' },
    { id: 'settlement-ledger', label: 'Audit Log' }
  ];

  const handleExportClick = async () => {
    if (isExporting || !hasData) return;
    setIsExporting(true);
    try {
      await onExportCSV();
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 px-4 md:px-6 py-2.5 flex items-center justify-between gap-4 z-30 select-none">
      {/* Left: Sidebar Toggle + Bespoke Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidePanel}
          className="btn-tactile p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
          title={isSidePanelOpen ? 'Collapse Controls Panel' : 'Expand Controls Panel'}
          aria-label={isSidePanelOpen ? 'Collapse Controls Panel' : 'Expand Controls Panel'}
          aria-expanded={isSidePanelOpen}
        >
          {isSidePanelOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeft className="w-4 h-4" />
          )}
        </button>

        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-slate-900 text-white rounded-lg shadow-xs">
            <Wind className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
                UK Day-Ahead Wind Cockpit
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                January 2026
              </span>
            </div>
            <p className="hidden lg:block text-[11px] text-slate-500 leading-none mt-0.5">
              Elexon BMRS Real-Time Settlement Reconciliation
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Section Jumps (Visible on medium/large screens) */}
      <nav className="hidden md:flex items-center gap-1 bg-slate-50 border border-slate-200/90 rounded-lg p-1" aria-label="Section navigation">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => onNavigateSection(s.id)}
            className={`btn-tactile px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none ${
              activeSection === s.id
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            aria-current={activeSection === s.id ? 'true' : undefined}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {/* Right Controls: Snap Toggle + Live Status + Export */}
      <div className="flex items-center gap-2.5">
        {/* Snap-to-View Toggle */}
        <button
          onClick={onToggleSnap}
          className={`btn-tactile flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none ${
            isSnapEnabled
              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
          }`}
          title={isSnapEnabled ? 'Disable Viewport Scroll Snapping' : 'Enable Viewport Scroll Snapping'}
          aria-label={isSnapEnabled ? 'Disable Scroll Snapping' : 'Enable Scroll Snapping'}
          aria-pressed={isSnapEnabled}
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Snap View:</span>
          <span>{isSnapEnabled ? 'ON' : 'OFF'}</span>
        </button>

        {/* Live stream dot — status indicator with smooth energy pulse */}
        <span className="hidden lg:flex relative h-2.5 w-2.5 items-center justify-center" title="Elexon BMRS Real-time Connected">
          <span className="pulse-indicator inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>

        {/* Hardened CSV Export Button with debounce guard */}
        <button
          onClick={handleExportClick}
          disabled={!hasData || isExporting}
          className="btn-tactile flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg shadow-2xs border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
          title="Export Settlement Periods Audit Log (CSV)"
          aria-label="Export Audit Log CSV"
        >
          {isExporting ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isExporting ? 'Exported' : 'Export CSV'}</span>
        </button>
      </div>
    </header>
  );
}
