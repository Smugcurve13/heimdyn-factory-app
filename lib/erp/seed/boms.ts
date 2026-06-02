import { Bom } from '../types';

/**
 * Fixed recipe per product (SOW §4 — custom recipes are out of scope).
 * Quantities are per single pallet built.
 *
 * Demo note: PRD-102 needs 9 × RM-203 Hardwood Block per unit. At an order of 500
 * that is 4,500 units against 3,000 in stock — short by 1,500, which triggers the
 * single Purchase Order in the Phase 5 cascade. Every other line stays sufficient.
 */
export const boms: Bom[] = [
  {
    productId: 'PRD-101',
    lines: [
      { materialId: 'RM-201', qtyPerUnit: 5 },
      { materialId: 'RM-202', qtyPerUnit: 3 },
      { materialId: 'RM-203', qtyPerUnit: 9 },
      { materialId: 'RM-205', qtyPerUnit: 0.35 },
      { materialId: 'RM-212', qtyPerUnit: 1 },
    ],
  },
  {
    productId: 'PRD-102',
    lines: [
      { materialId: 'RM-201', qtyPerUnit: 6 },
      { materialId: 'RM-202', qtyPerUnit: 4 },
      { materialId: 'RM-203', qtyPerUnit: 9 },
      { materialId: 'RM-205', qtyPerUnit: 0.4 },
      { materialId: 'RM-212', qtyPerUnit: 1 },
    ],
  },
  {
    productId: 'PRD-103',
    lines: [
      { materialId: 'RM-201', qtyPerUnit: 6 },
      { materialId: 'RM-202', qtyPerUnit: 4 },
      { materialId: 'RM-203', qtyPerUnit: 9 },
      { materialId: 'RM-206', qtyPerUnit: 0.4 },
      { materialId: 'RM-212', qtyPerUnit: 1 },
    ],
  },
  {
    productId: 'PRD-104',
    lines: [
      { materialId: 'RM-204', qtyPerUnit: 3 },
      { materialId: 'RM-209', qtyPerUnit: 5 },
      { materialId: 'RM-205', qtyPerUnit: 0.3 },
      { materialId: 'RM-212', qtyPerUnit: 1 },
    ],
  },
  {
    productId: 'PRD-105',
    lines: [
      { materialId: 'RM-201', qtyPerUnit: 3 },
      { materialId: 'RM-202', qtyPerUnit: 2 },
      { materialId: 'RM-203', qtyPerUnit: 4 },
      { materialId: 'RM-205', qtyPerUnit: 0.2 },
      { materialId: 'RM-212', qtyPerUnit: 1 },
    ],
  },
  {
    productId: 'PRD-106',
    lines: [
      { materialId: 'RM-209', qtyPerUnit: 2 },
      { materialId: 'RM-208', qtyPerUnit: 24 },
      { materialId: 'RM-211', qtyPerUnit: 4 },
    ],
  },
  {
    productId: 'PRD-107',
    lines: [
      { materialId: 'RM-215', qtyPerUnit: 8 },
      { materialId: 'RM-205', qtyPerUnit: 0.3 },
      { materialId: 'RM-212', qtyPerUnit: 1 },
    ],
  },
  {
    productId: 'PRD-108',
    lines: [
      { materialId: 'RM-215', qtyPerUnit: 10 },
      { materialId: 'RM-206', qtyPerUnit: 0.35 },
      { materialId: 'RM-212', qtyPerUnit: 1 },
    ],
  },
  {
    productId: 'PRD-109',
    lines: [
      { materialId: 'RM-215', qtyPerUnit: 7 },
      { materialId: 'RM-205', qtyPerUnit: 0.25 },
    ],
  },
  {
    productId: 'PRD-110',
    lines: [
      { materialId: 'RM-210', qtyPerUnit: 8 },
      { materialId: 'RM-203', qtyPerUnit: 12 },
      { materialId: 'RM-207', qtyPerUnit: 0.6 },
      { materialId: 'RM-214', qtyPerUnit: 0.05 },
      { materialId: 'RM-212', qtyPerUnit: 1 },
    ],
  },
];
