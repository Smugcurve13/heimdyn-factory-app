import { Customer } from './types';

export function findCustomerByName(customers: Customer[], name: string): Customer | undefined {
  const normalizedName = name.trim().toLowerCase();
  return customers.find((customer) => customer.name.toLowerCase() === normalizedName);
}

export function filterCustomers(customers: Customer[], query: string): Customer[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return customers;

  return customers.filter((customer) =>
    [customer.id, customer.name, customer.city].some((value) => value.toLowerCase().includes(normalizedQuery)),
  );
}
