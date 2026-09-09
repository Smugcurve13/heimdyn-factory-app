import { Customer } from './types';

export function filterCustomers(customers: Customer[], query: string): Customer[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return customers;

  return customers.filter((customer) =>
    [customer.id, customer.name, customer.city].some((value) => value.toLowerCase().includes(normalizedQuery)),
  );
}
