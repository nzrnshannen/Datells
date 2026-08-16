import { StoryData } from './schema';

export interface SavedReport {
  id: string;
  title: string;
  fileName: string;
  createdAt: string; // ISO timestamp
  rowCount: number;
  insightsSummary: string;
  dashboardState: StoryData;
}

const STORAGE_KEY = 'datells_reports';

export function getReports(): SavedReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    // Fallback for legacy single report (migration)
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) && parsed.title) {
      // It's a legacy report, migrate it to array format
      const legacyReport: SavedReport = {
        id: crypto.randomUUID(),
        title: parsed.title,
        fileName: 'Unknown Dataset',
        createdAt: new Date().toISOString(),
        rowCount: 0,
        insightsSummary: parsed.executiveSummary || '',
        dashboardState: parsed as StoryData
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([legacyReport]));
      return [legacyReport];
    }
    
    return parsed as SavedReport[];
  } catch (e) {
    console.error('Failed to parse reports from localStorage', e);
    return [];
  }
}

export function saveReport(report: SavedReport): void {
  if (typeof window === 'undefined') return;
  const reports = getReports();
  reports.push(report);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function loadReportById(id: string): SavedReport | null {
  const reports = getReports();
  return reports.find(r => r.id === id) || null;
}

export function deleteReport(id: string): void {
  if (typeof window === 'undefined') return;
  let reports = getReports();
  reports = reports.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}
