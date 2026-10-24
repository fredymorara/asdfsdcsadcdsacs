export const SITE_CONFIG = {
  name: "UK Day-Ahead Wind Forecast Cockpit",
  shortName: "WindCockpit",
  description: "Elexon BMRS Real-Time Reconciliation & Balancing Imbalance Exposure Engine",
  version: "2026.1.0",
  defaultDate: "2026-01-05",
  defaultCutoffHour: 12,
  defaultDayAheadPrice: 75,
  defaultCashoutPrice: 165,
  settlementPeriodCount: 48,
  peakPeriods: { start: 33, end: 40, label: "16:00 – 20:00 GMT (Peak Tea Hours)" },
  refreshIntervalMs: 60000,
};
