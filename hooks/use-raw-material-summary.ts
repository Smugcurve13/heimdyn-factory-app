import { useState, useEffect } from 'react';

export interface RawMaterialMonth {
  month: string;
  purchased_kg: number;
  consumed_kg: number;
}

export interface RawMaterialSummaryResult {
  lastMonth: RawMaterialMonth | null;
  prevMonth: RawMaterialMonth | null;
  loading: boolean;
  error: string | null;
}

export function useRawMaterialSummary(): RawMaterialSummaryResult {
  const [lastMonth, setLastMonth] = useState<RawMaterialMonth | null>(null);
  const [prevMonth, setPrevMonth] = useState<RawMaterialMonth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/raw-material-summary');
        if (!res.ok) throw new Error('Failed to fetch raw material data');
        const json: { month: string; purchased_kg: string; consumed_kg: string }[] = await res.json();
        const rows = json.map((r) => ({
          month: r.month,
          purchased_kg: Number(r.purchased_kg),
          consumed_kg: Number(r.consumed_kg),
        }));
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
