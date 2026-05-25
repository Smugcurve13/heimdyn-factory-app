import { ChartType } from '@/components/features/make-your-own/widgetCatalog';
import { LayoutItem } from 'react-grid-layout';

export interface DashboardItem {
  layoutId: string;
  type: 'chart' | 'kpi';
  widgetId: string;
  chartStyle?: ChartType;
}

export interface SavedDashboard {
  id: string;
  name: string;
  createdAt: string;
  layout: LayoutItem[];
  items: DashboardItem[];
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('access_token') ?? '') : '';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function loadDashboards(): Promise<SavedDashboard[]> {
  try {
    const res = await fetch('/api/dashboards', { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json() as Promise<SavedDashboard[]>;
  } catch {
    return [];
  }
}

export async function loadDashboard(id: string): Promise<SavedDashboard | null> {
  try {
    const res = await fetch(`/api/dashboards/${id}`, { headers: authHeaders() });
    if (!res.ok) return null;
    return res.json() as Promise<SavedDashboard>;
  } catch {
    return null;
  }
}

export async function saveDashboard(dashboard: SavedDashboard): Promise<void> {
  await fetch(`/api/dashboards/${dashboard.id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ layout: dashboard.layout, items: dashboard.items }),
  });
  window.dispatchEvent(new Event('dashboards-updated'));
}

export async function createDashboard(name: string): Promise<SavedDashboard> {
  const res = await fetch('/api/dashboards', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  });
  const dashboard = (await res.json()) as SavedDashboard;
  window.dispatchEvent(new Event('dashboards-updated'));
  return dashboard;
}

export async function deleteDashboard(id: string): Promise<void> {
  await fetch(`/api/dashboards/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  window.dispatchEvent(new Event('dashboards-updated'));
}
