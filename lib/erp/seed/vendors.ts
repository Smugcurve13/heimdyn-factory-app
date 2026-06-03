import { Vendor } from '../types';

/** Material suppliers for purchasing (reuses the existing vendor concept, SOW §9.1). */
export const vendors: Vendor[] = [
  { id: 'VEN-501', name: 'Timberline Lumber Co.', category: 'Lumber' },
  { id: 'VEN-502', name: 'Cascade Hardwoods', category: 'Lumber' },
  { id: 'VEN-503', name: 'IronHold Fasteners', category: 'Fasteners' },
  { id: 'VEN-504', name: 'PacWest Packaging', category: 'Packaging' },
  { id: 'VEN-505', name: 'Summit Adhesives & Coatings', category: 'Adhesives' },
  { id: 'VEN-506', name: 'GreenCycle Recyclers', category: 'Recycled Materials' },
];
