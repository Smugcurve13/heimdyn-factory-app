'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SignedIn } from '@/components/AuthProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ShoppingCart, FileText, CreditCard, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { customerService, type Customer, type CustomerErpData } from '@/services/api';
import { getCustomerErpData, formatCurrency } from '@/lib/mock-data';

import { DetailHeader } from '@/components/features/erp/detail-header';
import { DetailSidebar } from '@/components/features/erp/detail-sidebar';
import { CustomerOverviewTab } from '@/components/features/erp/customer-tabs/overview-tab';
import { CustomerOrdersTab } from '@/components/features/erp/customer-tabs/orders-tab';
import { CustomerInvoicesTab } from '@/components/features/erp/customer-tabs/invoices-tab';
import { CustomerPaymentsTab } from '@/components/features/erp/customer-tabs/payments-tab';
import { CustomerProductsTab } from '@/components/features/erp/customer-tabs/products-tab';
import { CustomerAnalyticsTab } from '@/components/features/erp/customer-tabs/analytics-tab';
import { CustomerDocumentsTab } from '@/components/features/erp/customer-tabs/documents-tab';
import { CustomerActivityTab } from '@/components/features/erp/customer-tabs/activity-tab';
import { CustomerSettingsTab } from '@/components/features/erp/customer-tabs/settings-tab';

const emptyForm = {
  name: '',
  contact_person: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  status: 'active',
};

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const customerId = Number(params.id);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [erp, setErp] = useState<CustomerErpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCustomer = useCallback(async () => {
    setLoading(true);
    try {
      const response = await customerService.getCustomer(customerId);
      setCustomer(response.data);
      setErp(getCustomerErpData(response.data.name));
    } catch {
      toast({ title: 'Error', description: 'Failed to load customer', variant: 'destructive' });
      router.push('/customers');
    } finally {
      setLoading(false);
    }
  }, [customerId, router, toast]);

  useEffect(() => { fetchCustomer(); }, [fetchCustomer]);

  const handleOpenEdit = () => {
    if (!customer) return;
    setFormData({
      name: customer.name,
      contact_person: customer.contact_person || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      status: customer.status,
    });
    setIsEditOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      const response = await customerService.updateCustomer(customerId, formData);
      if (response.success) {
        toast({ title: 'Success', description: 'Customer updated' });
        setIsEditOpen(false);
        fetchCustomer();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update customer', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await customerService.deleteCustomer(customerId);
      if (response.success) {
        toast({ title: 'Success', description: 'Customer deleted' });
        router.push('/customers');
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete customer', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <SignedIn>
        <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading customer...
        </div>
      </SignedIn>
    );
  }

  if (!customer) return null;

  const revenue = erp ? erp.orders.reduce((s, o) => s + o.amount, 0) : 0;
  const outstanding = erp
    ? erp.invoices.filter((i) => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0)
    : 0;
  const totalOrders = erp ? erp.orders.length : 0;
  const productCount = erp ? erp.products.length : 0;

  return (
    <SignedIn>
      <div className="flex gap-6 p-6">
        <div className="min-w-0 flex-1 space-y-6">
          <DetailHeader
            title={customer.name}
            subtitle={erp ? `${erp.industry} · ${customer.city ?? ''}` : customer.city ?? undefined}
            backHref="/customers"
            status={customer.status}
            metadata={[
              ...(erp ? [{ label: 'Industry', value: erp.industry }] : []),
              { label: 'Location', value: `${customer.city ?? ''}${customer.state ? `, ${customer.state}` : ''}` },
              ...(erp ? [{ label: 'Customer Since', value: new Date(erp.customerSince).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) }] : []),
            ]}
            metrics={[
              { label: 'Revenue', value: formatCurrency(revenue) },
              { label: 'Orders', value: String(totalOrders) },
              { label: 'Outstanding', value: formatCurrency(outstanding) },
              { label: 'Products', value: String(productCount) },
            ]}
            actions={[
              { label: 'Create Order', icon: <ShoppingCart className="h-3.5 w-3.5" />, disabled: true },
              { label: 'Generate Invoice', icon: <FileText className="h-3.5 w-3.5" />, disabled: true },
              { label: 'Add Payment', icon: <CreditCard className="h-3.5 w-3.5" />, disabled: true },
              { label: 'Edit Customer', icon: <Edit className="h-3.5 w-3.5" />, onClick: handleOpenEdit },
            ]}
          />

          <Tabs defaultValue="overview">
            <TabsList className="flex-wrap">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <CustomerOverviewTab customer={customer} erp={erp} />
            </TabsContent>
            <TabsContent value="orders" className="mt-4">
              <CustomerOrdersTab orders={erp?.orders ?? []} />
            </TabsContent>
            <TabsContent value="invoices" className="mt-4">
              <CustomerInvoicesTab invoices={erp?.invoices ?? []} />
            </TabsContent>
            <TabsContent value="payments" className="mt-4">
              <CustomerPaymentsTab payments={erp?.payments ?? []} invoices={erp?.invoices ?? []} />
            </TabsContent>
            <TabsContent value="products" className="mt-4">
              <CustomerProductsTab products={erp?.products ?? []} />
            </TabsContent>
            <TabsContent value="analytics" className="mt-4">
              {erp ? <CustomerAnalyticsTab erp={erp} /> : <p className="text-muted-foreground">No analytics data available</p>}
            </TabsContent>
            <TabsContent value="documents" className="mt-4">
              <CustomerDocumentsTab documents={erp?.documents ?? []} />
            </TabsContent>
            <TabsContent value="activity" className="mt-4">
              <CustomerActivityTab activity={erp?.activity ?? []} />
            </TabsContent>
            <TabsContent value="settings" className="mt-4">
              <CustomerSettingsTab customer={customer} onEdit={handleOpenEdit} onDelete={() => setDeleteOpen(true)} />
            </TabsContent>
          </Tabs>
        </div>

        <aside className="hidden w-72 shrink-0 xl:block">
          <div className="sticky top-6 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <DetailSidebar
              recentActivity={erp?.activity ?? []}
              quickActions={[
                { label: 'Create Order', icon: <ShoppingCart className="h-4 w-4" />, disabled: true },
                { label: 'Generate Invoice', icon: <FileText className="h-4 w-4" />, disabled: true },
                { label: 'Add Payment', icon: <CreditCard className="h-4 w-4" />, disabled: true },
              ]}
              relatedRecords={[
                { label: 'Orders', count: totalOrders },
                { label: 'Invoices', count: erp?.invoices.length ?? 0 },
                { label: 'Products', count: productCount },
                { label: 'Documents', count: erp?.documents.length ?? 0 },
              ]}
            />
          </div>
        </aside>
      </div>

      {/* Edit Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>Edit Customer</SheetTitle>
            <SheetDescription>Update customer information.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name <span className="text-destructive">*</span></Label>
              <Input id="edit-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-11" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cp">Contact Person</Label>
              <Input id="edit-cp" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} className="h-11" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input id="edit-phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Textarea id="edit-address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-city">City</Label>
                <Input id="edit-city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-state">State</Label>
                <Input id="edit-state" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving} className="h-11 flex-1">Cancel</Button>
              <Button type="submit" disabled={isSaving} className="h-11 flex-1">
                {isSaving ? 'Updating...' : 'Update Customer'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete customer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete &quot;{customer.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Customer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SignedIn>
  );
}
