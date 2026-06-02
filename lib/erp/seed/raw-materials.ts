import { RawMaterial } from '../types';

/**
 * Materials consumed in production (SOW §4). Stock levels are tuned so that the
 * demo product (PRD-102) is short on exactly one material — RM-203 Hardwood Block —
 * which is what makes the Phase 5 cascade raise a single Purchase Order.
 */
export const rawMaterials: RawMaterial[] = [
  { id: 'RM-201', name: 'Pine Plank 2×4', uom: 'metres', stock: 12000 },
  { id: 'RM-202', name: 'Pine Deck Board 1×6', uom: 'metres', stock: 8000 },
  { id: 'RM-203', name: 'Hardwood Block', uom: 'units', stock: 3000 },
  { id: 'RM-204', name: 'Pine Stringer 2×4×48', uom: 'units', stock: 5400 },
  { id: 'RM-205', name: 'Steel Nails 2"', uom: 'kilograms', stock: 850 },
  { id: 'RM-206', name: 'Steel Nails 3"', uom: 'kilograms', stock: 600 },
  { id: 'RM-207', name: 'Galvanised Coil Nails', uom: 'kilograms', stock: 430 },
  { id: 'RM-208', name: 'Wood Screws', uom: 'units', stock: 26000 },
  { id: 'RM-209', name: 'Pine Board 1×4', uom: 'metres', stock: 6700 },
  { id: 'RM-210', name: 'Oak Plank 2×6', uom: 'metres', stock: 2100 },
  { id: 'RM-211', name: 'Plastic Corner Guards', uom: 'units', stock: 9400 },
  { id: 'RM-212', name: 'Heat-Treatment Label', uom: 'units', stock: 14000 },
  { id: 'RM-213', name: 'Pallet Strapping Band', uom: 'metres', stock: 5200 },
  { id: 'RM-214', name: 'Wood Glue Adhesive', uom: 'gallons', stock: 180 },
  { id: 'RM-215', name: 'Recycled Mixed Lumber', uom: 'metres', stock: 7600 },
];
