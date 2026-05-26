'use client';

import dynamic from 'next/dynamic';
import type { Options } from 'highcharts';
import type { VendorErpData } from '@/services/api';
import { StatCard } from '@/components/features/erp/stat-card';
import { ChartCard } from '@/components/features/erp/chart-card';
import { BASE_THEME, CHART_COLORS } from '@/lib/chart-theme';

const HighchartsReact = dynamic(() => import('highcharts-react-official'), { ssr: false });

function mergeTheme(opts: Partial<Options>): Options {
  return { ...BASE_THEME, ...opts } as Options;
}

function parseDelay(delay: string): number {
  if (delay === 'None') return 0;
  const match = delay.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export function VendorPerformanceTab({ erp }: { erp: VendorErpData }) {
  const total = erp.deliveries.length;
  const onTimeCount = erp.deliveries.filter((d) => d.delay === 'None').length;
  const onTimePct = total ? Math.round((onTimeCount / total) * 100) : 0;

  const totalDelay = erp.deliveries.reduce((s, d) => s + parseDelay(d.delay), 0);
  const avgDelay = total ? (totalDelay / total).toFixed(1) : '0';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const deliveriesByMonth = months.map((_, i) => {
    const month = String(i + 1).padStart(2, '0');
    return erp.deliveries.filter((d) => d.date.startsWith(`2026-${month}`)).length;
  });

  const chartOptions = mergeTheme({
    chart: { ...BASE_THEME.chart, type: 'column' },
    xAxis: { ...BASE_THEME.xAxis, categories: months },
    series: [{ name: 'Deliveries', data: deliveriesByMonth, color: CHART_COLORS[0], type: 'column' }],
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard title="On-time Delivery" value={`${onTimePct}%`} />
        <StatCard title="Average Delay" value={`${avgDelay} days`} />
        <StatCard title="Rejected Shipments" value="0%" />
        <StatCard title="Vendor Score" value={`${erp.vendorScore}/100`} />
      </div>

      <ChartCard title="Monthly Deliveries">
        <HighchartsReact options={chartOptions} />
      </ChartCard>
    </div>
  );
}
