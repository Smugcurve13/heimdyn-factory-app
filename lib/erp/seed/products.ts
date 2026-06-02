import { Product } from '../types';

/** Sellable, buildable pallets. Only new + recycled pallets are in scope (SOW §4). */
export const products: Product[] = [
  { id: 'PRD-101', name: 'Euro Pallet Standard 1200×800mm', type: 'New Pallet', priceUsd: 18.5, status: 'Active', finishedStock: 1850, reorderLevel: 300 },
  { id: 'PRD-102', name: 'Euro Pallet Heavy Duty 1200×800mm', type: 'New Pallet', priceUsd: 24.0, status: 'Active', finishedStock: 120, reorderLevel: 150 },
  { id: 'PRD-103', name: 'Standard Block Pallet 1200×1000mm', type: 'New Pallet', priceUsd: 21.0, status: 'Active', finishedStock: 60, reorderLevel: 100 },
  { id: 'PRD-104', name: 'US Stringer Pallet 48×40in', type: 'New Pallet', priceUsd: 16.75, status: 'Active', finishedStock: 940, reorderLevel: 200 },
  { id: 'PRD-105', name: 'Half Euro Pallet 800×600mm', type: 'New Pallet', priceUsd: 12.5, status: 'Active', finishedStock: 1320, reorderLevel: 200 },
  { id: 'PRD-106', name: 'Display Quarter Pallet 600×400mm', type: 'New Pallet', priceUsd: 9.25, status: 'Inactive', finishedStock: 2100, reorderLevel: 200 },
  { id: 'PRD-107', name: 'Recycled Euro Pallet 1200×800mm', type: 'Recycled Pallet', priceUsd: 9.0, status: 'Active', finishedStock: 760, reorderLevel: 150 },
  { id: 'PRD-108', name: 'Recycled Block Pallet 1200×1000mm', type: 'Recycled Pallet', priceUsd: 10.5, status: 'Active', finishedStock: 540, reorderLevel: 150 },
  { id: 'PRD-109', name: 'Recycled US Pallet 48×40in', type: 'Recycled Pallet', priceUsd: 8.0, status: 'Active', finishedStock: 480, reorderLevel: 150 },
  { id: 'PRD-110', name: 'Heavy Duty Export Pallet 1140×1140mm', type: 'New Pallet', priceUsd: 27.5, status: 'Active', finishedStock: 30, reorderLevel: 100 },
];
