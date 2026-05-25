import { useState, useEffect } from 'react';

export interface GapMonthData {
  month: string;
  gap: number;
}

export interface ProductionDeliveryGapResult {
  lastMonth: GapMonthData | null;
  prevMonth: GapMonthData | null;
  loading: boolean;
  error: string | null;
}

export function useProductionDeliveryGap(): ProductionDeliveryGapResult {
  const [lastMonth, setLastMonth] = useState<GapMonthData | null>(null);
  const [prevMonth, setPrevMonth] = useState<GapMonthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/production-delivery-gap');
        if (!res.ok) throw new Error('Failed to fetch gap data');
        const json: { month: string; gap: string }[] = await res.json();
        const rows = json.map((r) => ({ month: r.month, gap: Number(r.gap) }));
        setPrevMonth(rows[0] ?? null);
        setLastMonth(rows[1] ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { lastMonth, prevMonth, loading, error };
}
