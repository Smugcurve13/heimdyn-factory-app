import { describe, expect, it } from 'vitest';
import { filterCustomers } from './customer-search';

const customers = [
  { id: 'CUS-601', name: 'Apex Fabrication', city: 'Pune' },
  { id: 'CUS-602', name: 'Brighton Components', city: 'Mumbai' },
  { id: 'CUS-603', name: 'Cedar Packaging', city: 'Chennai' },
];

describe('filterCustomers', () => {
  it('matches a customer name without regard to case', () => {
    expect(filterCustomers(customers, 'APEX')).toEqual([customers[0]]);
  });

  it('matches customer ID and city after trimming the search query', () => {
    expect(filterCustomers(customers, '  cus-602  ')).toEqual([customers[1]]);
    expect(filterCustomers(customers, 'chennai')).toEqual([customers[2]]);
  });

  it('returns every customer for an empty search query', () => {
    expect(filterCustomers(customers, '')).toEqual(customers);
  });
});
