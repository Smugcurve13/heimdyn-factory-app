'use client';

import dynamic from 'next/dynamic';
import type { Options } from 'highcharts';
import { ChartCard } from '@/components/features/erp/chart-card';
import { BASE_THEME, CHART_COLORS } from '@/lib/chart-theme';
import type { CustomerErpData } from '@/services/api';

const HighchartsReact = dynamic(() => import('highcharts-react-official'), { ssr: false });

function mergeTheme(opts: Partial<Options>): Options {
  return { ...BASE_THEME, ...opts } as Options;
}

export function CustomerAnalyticsTab({ erp }: { erp: CustomerErpData }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const revenueByMonth = months.map((_, i) => {
    const month = String(i + 1).padStart(2, '0');
    return erp.orders
      .filter((o) => o.date.startsWith(`2026-${month}`))
      .reduce((s, o) => s + o.amount, 0);
  });

  const orderCountByMonth = months.map((_, i) => {
    const month = String(i + 1).padStart(2, '0');
    return erp.orders.filter((o) => o.date.startsWith(`2026-${month}`)).length;
  });

  const productRevenue = erp.products.map((p) => ({
    name: p.product,
    y: p.revenueContribution,
  }));

  const paymentByMonth = months.map((_, i) => {
    const month = String(i + 1).padStart(2, '0');
    return erp.payments
      .filter((p) => p.date.startsWith(`2026-${month}`))
      .reduce((s, p) => s + p.amount, 0);
  });

  const revenueTrendOptions = mergeTheme({
    chart: { ...BASE_THEME.chart, type: 'areaspline' },
    xAxis: { ...BASE_THEME.xAxis, categories: months },
    series: [{ name: 'Revenue', data: revenueByMonth, color: CHART_COLORS[0], type: 'areaspline', fillOpacity: 0.1 }],
  });

  const orderFreqOptions = mergeTheme({
    chart: { ...BASE_THEME.chart, type: 'column' },
    xAxis: { ...BASE_THEME.xAxis, categories: months },
    series: [{ name: 'Orders', data: orderCountByMonth, color: CHART_COLORS[1], type: 'column' }],
  });

  const productDistOptions = mergeTheme({
    chart: { ...BASE_THEME.chart, type: 'pie' },
    plotOptions: { pie: { innerSize: '60%', dataLabels: { enabled: true, style: { color: '#94A3B8', fontSize: '11px', textOutline: 'none' } } } },
    series: [{ name: 'Revenue', data: productRevenue, type: 'pie', colors: CHART_COLORS }],
  });

  const paymentOptions = mergeTheme({
    chart: { ...BASE_THEME.chart, type: 'column' },
    xAxis: { ...BASE_THEME.xAxis, categories: months },
    series: [{ name: 'Payments', data: paymentByMonth, color: CHART_COLORS[2], type: 'column' }],
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title="Revenue Trend">
        <HighchartsReact options={revenueTrendOptions} />
      </ChartCard>
      <ChartCard title="Order Frequency">
        <HighchartsReact options={orderFreqOptions} />
      </ChartCard>
      <ChartCard title="Product Distribution">
        <HighchartsReact options={productDistOptions} />
      </ChartCard>
      <ChartCard title="Payment Behavior">
        <HighchartsReact options={paymentOptions} />
      </ChartCard>
    </div>
  );
}
