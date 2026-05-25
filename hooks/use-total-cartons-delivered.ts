import { useState, useEffect } from 'react';

export interface DeliveredMonthData {
  month: string;
  total: number;
}

export interface TotalUnitsDeliveredResult {
  lastMonth: DeliveredMonthData | null;
  prevMonth: DeliveredMonthData | null;
  loading: boolean;
  error: string | null;
}

export function useTotalUnitsDelivered(): TotalUnitsDeliveredResult {
  const [lastMonth, setLastMonth] = useState<DeliveredMonthData | null>(null);
  const [prevMonth, setPrevMonth] = useState<DeliveredMonthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/total-cartons-delivered');
        if (!res.ok) throw new Error('Failed to fetch delivery data');
        const json: { month: string; total: string }[] = await res.json();
        const rows = json.map((r) => ({ month: r.month, total: Number(r.total) }));
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
