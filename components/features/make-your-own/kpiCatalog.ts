import { Category } from './widgetCatalog';

export interface KpiDef {
  id: string;
  name: string;
  description: string;
  unit?: string;
  color: string;
  category: Category;
}

export const KPI_CATALOG: KpiDef[] = [
  {
    id: 'total-cartons-produced',
    name: 'Total Units Produced',
    description: 'Total units made in the last recorded month',
    color: '#10b981',
    category: 'Production',
  },
  {
    id: 'total-cartons-delivered',
    name: 'Total Units Delivered',
    description: 'Units dispatched to distributors last month',
    color: '#3b82f6',
    category: 'Sales',
  },
  {
    id: 'production-delivery-gap',
    name: 'Production vs Delivery Gap',
    description: 'Units produced minus delivered — positive = building stock',
    color: '#8b5cf6',
    category: 'Production',
  },
  {
    id: 'raw-material-purchased',
    name: 'Raw Material Purchased',
    description: 'Total kg of raw material purchased last month',
    unit: 'kg',
    color: '#f59e0b',
    category: 'Materials',
  },
  {
    id: 'raw-material-consumed',
    name: 'Raw Material Consumed',
    description: 'Total kg consumed in production last month',
    unit: 'kg',
    color: '#ef4444',
    category: 'Materials',
  },
  {
    id: 'unique-models-produced',
    name: 'Product Lines Active',
    description: 'Number of distinct product lines produced last month',
    color: '#06b6d4',
    category: 'Production',
  },
];
