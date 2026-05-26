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
import { clientService, type Client, type ClientErpData } from '@/services/api';
import { getClientErpData, formatCurrency } from '@/lib/mock-data';

import { DetailHeader } from '@/components/features/erp/detail-header';
import { DetailSidebar } from '@/components/features/erp/detail-sidebar';
import { ClientOverviewTab } from '@/components/features/erp/client-tabs/overview-tab';
import { ClientOrdersTab } from '@/components/features/erp/client-tabs/orders-tab';
import { ClientInvoicesTab } from '@/components/features/erp/client-tabs/invoices-tab';
import { ClientPaymentsTab } from '@/components/features/erp/client-tabs/payments-tab';
import { ClientProductsTab } from '@/components/features/erp/client-tabs/products-tab';
import { ClientAnalyticsTab } from '@/components/features/erp/client-tabs/analytics-tab';
import { ClientDocumentsTab } from '@/components/features/erp/client-tabs/documents-tab';
import { ClientActivityTab } from '@/components/features/erp/client-tabs/activity-tab';
import { ClientSettingsTab } from '@/components/features/erp/client-tabs/settings-tab';

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

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const clientId = Number(params.id);

  const [client, setClient] = useState<Client | null>(null);
  const [erp, setErp] = useState<ClientErpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchClient = useCallback(async () => {
    setLoading(true);
    try {
      const response = await clientService.getClient(clientId);
      setClient(response.data);
      setErp(getClientErpData(response.data.name));
    } catch {
      toast({ title: 'Error', description: 'Failed to load client', variant: 'destructive' });
      router.push('/clients');
    } finally {
      setLoading(false);
    }
  }, [clientId, router, toast]);

  useEffect(() => { fetchClient(); }, [fetchClient]);

  const handleOpenEdit = () => {
    if (!client) return;
    setFormData({
      name: client.name,
      contact_person: client.contact_person || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      city: client.city || '',
      state: client.state || '',
      status: client.status,
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
      const response = await clientService.updateClient(clientId, formData);
      if (response.success) {
        toast({ title: 'Success', description: 'Client updated' });
        setIsEditOpen(false);
        fetchClient();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update client', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await clientService.deleteClient(clientId);
      if (response.success) {
        toast({ title: 'Success', description: 'Client deleted' });
        router.push('/clients');
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete client', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <SignedIn>
        <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading client...
        </div>
      </SignedIn>
    );
  }

  if (!client) return null;

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
            title={client.name}
            subtitle={erp ? `${erp.industry} · ${client.city ?? ''}` : client.city ?? undefined}
            backHref="/clients"
            status={client.status}
            metadata={[
              ...(erp ? [{ label: 'Industry', value: erp.industry }] : []),
              { label: 'Location', value: `${client.city ?? ''}${client.state ? `, ${client.state}` : ''}` },
              ...(erp ? [{ label: 'Client Since', value: new Date(erp.clientSince).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) }] : []),
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
              { label: 'Edit Client', icon: <Edit className="h-3.5 w-3.5" />, onClick: handleOpenEdit },
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
              <ClientOverviewTab client={client} erp={erp} />
            </TabsContent>
            <TabsContent value="orders" className="mt-4">
              <ClientOrdersTab orders={erp?.orders ?? []} />
            </TabsContent>
            <TabsContent value="invoices" className="mt-4">
              <ClientInvoicesTab invoices={erp?.invoices ?? []} />
            </TabsContent>
            <TabsContent value="payments" className="mt-4">
              <ClientPaymentsTab payments={erp?.payments ?? []} invoices={erp?.invoices ?? []} />
            </TabsContent>
            <TabsContent value="products" className="mt-4">
              <ClientProductsTab products={erp?.products ?? []} />
            </TabsContent>
            <TabsContent value="analytics" className="mt-4">
              {erp ? <ClientAnalyticsTab erp={erp} /> : <p className="text-muted-foreground">No analytics data available</p>}
            </TabsContent>
            <TabsContent value="documents" className="mt-4">
              <ClientDocumentsTab documents={erp?.documents ?? []} />
            </TabsContent>
            <TabsContent value="activity" className="mt-4">
              <ClientActivityTab activity={erp?.activity ?? []} />
            </TabsContent>
            <TabsContent value="settings" className="mt-4">
              <ClientSettingsTab client={client} onEdit={handleOpenEdit} onDelete={() => setDeleteOpen(true)} />
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
            <SheetTitle>Edit Client</SheetTitle>
            <SheetDescription>Update client information.</SheetDescription>
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
                {isSaving ? 'Updating...' : 'Update Client'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete client?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete &quot;{client.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Client'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SignedIn>
  );
}
