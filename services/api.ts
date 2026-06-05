import { apiClient } from './config';

export interface LoginResponse {
  success: boolean;
  message?: string;
  access_token?: string;
  refresh_token?: string;
  user?: {
    id: number;
    email: string;
    username: string;
    role: string;
  };
}

export const authService = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post<LoginResponse>('/api/auth/login', credentials),
};

export interface Role {
  id: number;
  name: string;
  permissions?: {
    [key: string]: string[];
  };
}

export interface RolesResponse {
  data: Role[];
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    username: string;
    email: string;
    created_at: string;
    is_active: boolean;
    role: string;
  };
}

export interface UserData {
  id: number;
  username: string;
  email: string;
  created_at: string;
  is_active: boolean;
  last_login: string | null;
  role: string;
}

export interface UsersResponse {
  data: UserData[] | UserData;
}

export interface DeleteUserRequest {
  user_id: number;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}

export interface EditUserRequest {
  user_id: number;
  username: string;
  email: string;
  password?: string;
  role: string;
}

export interface EditUserResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export interface RoleRequest {
  action: 'create' | 'edit';
  role_id?: number;
  name: string;
  permissions?: {
    [key: string]: string;
  };
}

export interface RoleResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    name: string;
  };
}

export interface PermissionsResponse {
  [key: string]: string[];
}

export interface Customer {
  id: number;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  orderId: string;
  date: string;
  products: string;
  amount: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Processing';
  deliveryStatus: 'Delivered' | 'In Transit' | 'Pending' | 'Returned';
}

export interface Invoice {
  invoiceId: string;
  date: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface Payment {
  date: string;
  amount: number;
  method: string;
  referenceId: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

export interface ProductPurchase {
  product: string;
  unitsBought: number;
  revenueContribution: number;
  lastPurchased: string;
}

export interface ActivityEntry {
  date: string;
  description: string;
}

export interface DocumentEntry {
  name: string;
  type: string;
  date: string;
}

export type CustomerHealth = 'Good' | 'Delayed Payments' | 'Low Activity' | 'High Value';

export interface CustomerErpData {
  industry: string;
  customerSince: string;
  creditLimit: number;
  paymentTerms: string;
  health: CustomerHealth;
  orders: Order[];
  invoices: Invoice[];
  payments: Payment[];
  products: ProductPurchase[];
  documents: DocumentEntry[];
  activity: ActivityEntry[];
}

export interface PurchaseOrder {
  poId: string;
  date: string;
  material: string;
  quantity: number;
  amount: number;
  status: 'Approved' | 'Pending' | 'Delivered' | 'Cancelled';
}

export interface VendorMaterial {
  material: string;
  unitCost: number;
  lastPurchased: string;
  moq: number;
  leadTime: string;
}

export interface Delivery {
  shipmentId: string;
  date: string;
  status: 'Delivered' | 'In Transit' | 'Delayed' | 'Returned';
  delay: string;
}

export type VendorPerformance = 'Excellent' | 'Average' | 'Delayed' | 'Critical';

export interface VendorErpData {
  vendorSince: string;
  vendorScore: number;
  performance: VendorPerformance;
  paymentTerms: string;
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  payments: Payment[];
  materials: VendorMaterial[];
  deliveries: Delivery[];
  documents: DocumentEntry[];
  activity: ActivityEntry[];
}

export interface CustomersResponse {
  success: boolean;
  data: Customer[];
}

export interface CustomerResponse {
  success: boolean;
  data: Customer;
  message?: string;
}

export interface CustomerRequest {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  status?: string;
}

export interface Vendor {
  id: number;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  category: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface VendorsResponse {
  success: boolean;
  data: Vendor[];
}

export interface VendorResponse {
  success: boolean;
  data: Vendor;
  message?: string;
}

export interface VendorRequest {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  category?: string;
  address?: string;
  city?: string;
  state?: string;
  status?: string;
}

export const customerService = {
  getCustomers: (search?: string, status?: string) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    const qs = params.toString();
    return apiClient.get<CustomersResponse>(`/api/customers${qs ? `?${qs}` : ''}`, true);
  },
  getCustomer: (id: number) =>
    apiClient.get<CustomerResponse>(`/api/customers/${id}`, true),
  createCustomer: (data: CustomerRequest) =>
    apiClient.post<CustomerResponse>('/api/customers', data, true),
  updateCustomer: (id: number, data: CustomerRequest) =>
    apiClient.put<CustomerResponse>(`/api/customers/${id}`, data, true),
  deleteCustomer: (id: number) =>
    apiClient.delete<{ success: boolean; message: string }>(`/api/customers/${id}`, true),
};

export const vendorService = {
  getVendors: (search?: string, status?: string, category?: string) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (category) params.set('category', category);
    const qs = params.toString();
    return apiClient.get<VendorsResponse>(`/api/vendors${qs ? `?${qs}` : ''}`, true);
  },
  getVendor: (id: number) =>
    apiClient.get<VendorResponse>(`/api/vendors/${id}`, true),
  createVendor: (data: VendorRequest) =>
    apiClient.post<VendorResponse>('/api/vendors', data, true),
  updateVendor: (id: number, data: VendorRequest) =>
    apiClient.put<VendorResponse>(`/api/vendors/${id}`, data, true),
  deleteVendor: (id: number) =>
    apiClient.delete<{ success: boolean; message: string }>(`/api/vendors/${id}`, true),
};

export const userService = {
  getRoles: () => apiClient.get<RolesResponse>('/api/user/get_roles', true),
  getUsers: (userId?: number) => {
    const endpoint = userId ? `/api/user/get_users?id=${userId}` : '/api/user/get_users';
    return apiClient.get<UsersResponse>(endpoint, true);
  },
  createUser: (data: CreateUserRequest) =>
    apiClient.post<CreateUserResponse>('/api/user/create', data, true),
  editUser: (data: EditUserRequest) =>
    apiClient.post<EditUserResponse>('/api/user/edit', data, true),
  deleteUser: (data: DeleteUserRequest) =>
    apiClient.post<DeleteUserResponse>('/api/user/delete', data, true),
  manageRole: (data: RoleRequest) =>
    apiClient.post<RoleResponse>('/api/user/role', data, true),
  getPermissions: () =>
    apiClient.get<PermissionsResponse>('/api/user/role/get_permissions', true),
};
