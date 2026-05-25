export type ChartType = 'line' | 'bar' | 'hbar' | 'donut' | 'multiline';
export type Category  = 'Production' | 'Sales' | 'Materials';

/** One canonical accent colour per category — used for card borders, pills, and widget headers. */
export const CATEGORY_COLORS: Record<Category, string> = {
  Production: '#3b82f6',   // blue
  Sales:      '#10b981',   // emerald
  Materials:  '#8b5cf6',   // violet
};

export interface WidgetDef {
  id: string;
  name: string;
  description: string;
  category: Category;
  chartType: ChartType;
  supportedChartTypes?: ChartType[];
  color: string;
  defaultW: number;
  defaultH: number;
  // For multiline charts, specify the two series keys
  seriesKeys?: string[];
}

export const WIDGET_CATALOG: WidgetDef[] = [
  {
    id: 'cartons-by-month',
    name: 'Units Produced / Month',
    description: 'Monthly output trend across all production runs',
    category: 'Production',
    chartType: 'line',
    supportedChartTypes: ['line', 'bar'],
    color: '#10b981',
    defaultW: 6,
    defaultH: 5,
  },
  {
    id: 'delivery-by-month',
    name: 'Units Delivered / Month',
    description: 'Monthly delivery volume dispatched to distributors',
    category: 'Sales',
    chartType: 'line',
    supportedChartTypes: ['line', 'bar'],
    color: '#3b82f6',
    defaultW: 6,
    defaultH: 5,
  },
  {
    id: 'production-vs-delivery',
    name: 'Production vs Delivery',
    description: 'Side-by-side monthly comparison of output vs dispatch',
    category: 'Production',
    chartType: 'multiline',
    supportedChartTypes: ['multiline'],
    color: '#8b5cf6',
    defaultW: 8,
    defaultH: 5,
    seriesKeys: ['produced', 'delivered'],
  },
  {
    id: 'sales-by-executive',
    name: 'Sales by Rep',
    description: 'Total units delivered per sales rep',
    category: 'Sales',
    chartType: 'hbar',
    supportedChartTypes: ['hbar', 'bar', 'donut'],
    color: '#f59e0b',
    defaultW: 5,
    defaultH: 6,
  },
  {
    id: 'production-by-model',
    name: 'Production by Product Line',
    description: 'Units produced broken down by product line',
    category: 'Production',
    chartType: 'donut',
    supportedChartTypes: ['donut', 'bar', 'hbar'],
    color: '#06b6d4',
    defaultW: 4,
    defaultH: 5,
  },
  {
    id: 'production-by-shift',
    name: 'Production by Shift',
    description: 'Share of total output across each production shift',
    category: 'Production',
    chartType: 'donut',
    supportedChartTypes: ['donut', 'bar'],
    color: '#f97316',
    defaultW: 4,
    defaultH: 5,
  },
  {
    id: 'top-blanks-usage',
    name: 'Top Components by Usage',
    description: 'Top 10 components ranked by kg consumed',
    category: 'Materials',
    chartType: 'hbar',
    supportedChartTypes: ['hbar', 'bar', 'donut'],
    color: '#6366f1',
    defaultW: 5,
    defaultH: 7,
  },
  {
    id: 'raw-material-by-vendor',
    name: 'Raw Material by Vendor',
    description: 'Total kg of raw material purchased per vendor',
    category: 'Materials',
    chartType: 'hbar',
    supportedChartTypes: ['hbar', 'bar', 'donut'],
    color: '#ec4899',
    defaultW: 5,
    defaultH: 6,
  },
  {
    id: 'consumption-by-shift',
    name: 'Consumption by Shift',
    description: 'kg of components consumed split by shift',
    category: 'Materials',
    chartType: 'bar',
    supportedChartTypes: ['bar', 'donut'],
    color: '#14b8a6',
    defaultW: 4,
    defaultH: 5,
  },
  {
    id: 'delivery-by-dealer',
    name: 'Deliveries by Distributor',
    description: 'Top 10 distributors by total units received',
    category: 'Sales',
    chartType: 'hbar',
    supportedChartTypes: ['hbar', 'bar', 'donut'],
    color: '#84cc16',
    defaultW: 5,
    defaultH: 7,
  },
];

export const CATEGORIES = ['Production', 'Sales', 'Materials'] as const;
