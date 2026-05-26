import type { Options } from 'highcharts';

export const BASE_THEME: Partial<Options> = {
  chart: { backgroundColor: 'transparent', style: { fontFamily: 'inherit' } },
  title: { text: undefined },
  subtitle: { text: undefined },
  credits: { enabled: false },
  legend: {
    itemStyle: { color: '#CBD5E1', fontWeight: '500', fontSize: '12px' },
    itemHoverStyle: { color: '#F8FAFC' },
  },
  xAxis: {
    labels: { style: { color: '#94A3B8', fontSize: '11px' } },
    lineColor: 'rgba(148, 163, 184, 0.16)',
    tickColor: 'transparent',
    gridLineWidth: 0,
  },
  yAxis: {
    labels: { style: { color: '#94A3B8', fontSize: '11px' } },
    gridLineColor: 'rgba(148, 163, 184, 0.1)',
    title: { text: null },
  },
  tooltip: {
    backgroundColor: '#0F172A',
    borderColor: 'rgba(148, 163, 184, 0.25)',
    borderRadius: 12,
    style: { color: '#F8FAFC', fontSize: '13px' },
    shadow: { color: '#020617', opacity: 0.35, offsetX: 0, offsetY: 8, width: 18 },
  },
};

export const CHART_COLORS = ['#60A5FA', '#34D399', '#A78BFA', '#FBBF24', '#F87171'];
