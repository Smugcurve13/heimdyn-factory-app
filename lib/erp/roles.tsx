'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

/** The six Phase 2 roles (SOW §6). UI switcher only — not real auth (Phase 3). */
export const ROLES = [
  'Admin',
  'Sales Executive',
  'Sales Manager',
  'Production Manager',
  'Purchase Manager',
  'Accounts',
] as const;

export type Role = (typeof ROLES)[number];

/** Action capabilities gated by role. Admin can do everything. */
export type Capability =
  | 'quotation:create'
  | 'quotation:approve'
  | 'mo:manage'
  | 'po:manage'
  | 'so:manage'
  | 'inventory:addStock'
  | 'product:manage'
  | 'demo:reset';

const CAPS: Record<Capability, Role[]> = {
  'quotation:create': ['Sales Executive', 'Admin'],
  'quotation:approve': ['Sales Manager', 'Admin'],
  'mo:manage': ['Production Manager', 'Admin'],
  'po:manage': ['Purchase Manager', 'Admin'],
  'so:manage': ['Accounts', 'Admin'],
  'inventory:addStock': ['Purchase Manager', 'Admin'],
  'product:manage': ['Admin'],
  'demo:reset': ['Admin'],
};

interface RoleContextValue {
  role: Role;
  setRole: (r: Role) => void;
  can: (cap: Capability) => boolean;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('Admin');
  const can = (cap: Capability) => CAPS[cap].includes(role);
  return <RoleContext.Provider value={{ role, setRole, can }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within a RoleProvider');
  return ctx;
}
