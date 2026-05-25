import { useState, useEffect } from 'react';

export interface ComponentUsageRow {
  component: string;
  total_kgs: number;
}

export function useComponentsUsage() {
  const [data, setData] = useState<ComponentUsageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/blanks-usage-heatmap');
        if (!res.ok) throw new Error('Failed to fetch component usage data');
        const json: { component: string; total_kgs: string }[] = await res.json();
        setData(json.map((r) => ({ component: r.component, total_kgs: Number(r.total_kgs) })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, loading, error };
}
