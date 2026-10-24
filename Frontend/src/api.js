const BASE_URL = import.meta.env.VITE_API_URL || "";

export async function fetchForecastAnalysis(date = "2026-01-05", cutoffHour = 12, signal) {
  const url = `${BASE_URL}/api/forecast-analysis?date=${encodeURIComponent(date)}&cutoff_hour=${encodeURIComponent(cutoffHour)}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  
  try {
    const response = await fetch(url, {
      signal: signal || controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}: ${response.statusText || 'Unable to retrieve analysis'}`);
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error("Request to BMRS Analysis API timed out after 8 seconds.", { cause: err });
    }
    throw new Error(err.message || "Failed to connect to forecast backend service", { cause: err });
  } finally {
    clearTimeout(timeoutId);
  }
}