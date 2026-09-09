import { describe, expect, it } from 'vitest';
import { findCustomerByName } from './customer-search';

const customers = [
  { id: 'CUS-601', name: 'Apex Fabrication', city: 'Pune' },
  { id: 'CUS-602', name: 'Brighton Components', city: 'Mumbai' },
];

describe('findCustomerByName', () => {
  it('resolves an autocomplete selection by name without regard to case or surrounding spaces', () => {
    expect(findCustomerByName(customers, '  apex fabrication  ')).toEqual(customers[0]);
  });

  it('does not select a customer for a partial autocomplete query', () => {
    expect(findCustomerByName(customers, 'Bright')).toBeUndefined();
  });
});
