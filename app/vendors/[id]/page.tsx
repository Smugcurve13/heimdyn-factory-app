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
import { Loader2, ClipboardList, FileText, CreditCard, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { vendorService, type Vendor, type VendorErpData } from '@/services/api';
import { getVendorErpData, formatCurrency } from '@/lib/mock-data';

import { DetailHeader } from '@/components/features/erp/detail-header';
import { DetailSidebar } from '@/components/features/erp/detail-sidebar';
import { VendorOverviewTab } from '@/components/features/erp/vendor-tabs/overview-tab';
import { VendorPurchaseOrdersTab } from '@/components/features/erp/vendor-tabs/purchase-orders-tab';
import { VendorInvoicesTab } from '@/components/features/erp/vendor-tabs/invoices-tab';
import { VendorMaterialsTab } from '@/components/features/erp/vendor-tabs/materials-tab';
import { VendorDeliveriesTab } from '@/components/features/erp/vendor-tabs/deliveries-tab';
import { VendorPerformanceTab } from '@/components/features/erp/vendor-tabs/performance-tab';
import { VendorDocumentsTab } from '@/components/features/erp/vendor-tabs/documents-tab';
import { VendorActivityTab } from '@/components/features/erp/vendor-tabs/activity-tab';
import { VendorSettingsTab } from '@/components/features/erp/vendor-tabs/settings-tab';

const emptyForm = {
  name: '',
  contact_person: '',
  email: '',
  phone: '',
  category: '',
  address: '',
  city: '',
  state: '',
  status: 'active',
};

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const vendorId = Number(params.id);

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [erp, setErp] = useState<VendorErpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVendor = useCallback(async () => {
    setLoading(true);
    try {
      const response = await vendorService.getVendor(vendorId);
      setVendor(response.data);
      setErp(getVendorErpData(response.data.name));
    } catch {
      toast({ title: 'Error', description: 'Failed to load vendor', variant: 'destructive' });
      router.push('/vendors');
    } finally {
      setLoading(false);
    }
  }, [vendorId, router, toast]);

  useEffect(() => { fetchVendor(); }, [fetchVendor]);

  const handleOpenEdit = () => {
    if (!vendor) return;
    setFormData({
      name: vendor.name,
      contact_person: vendor.contact_person || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      category: vendor.category || '',
      address: vendor.address || '',
      city: vendor.city || '',
      state: vendor.state || '',
      status: vendor.status,
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
      const response = await vendorService.updateVendor(vendorId, formData);
      if (response.success) {
        toast({ title: 'Success', description: 'Vendor updated' });
        setIsEditOpen(false);
        fetchVendor();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update vendor', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await vendorService.deleteVendor(vendorId);
      if (response.success) {
        toast({ title: 'Success', description: 'Vendor deleted' });
        router.push('/vendors');
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete vendor', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <SignedIn>
        <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading vendor...
        </div>
      </SignedIn>
    );
  }

  if (!vendor) return null;

  const totalSpend = erp ? erp.purchaseOrders.reduce((s, po) => s + po.amount, 0) : 0;
  const pendingDeliveries = erp
    ? erp.deliveries.filter((d) => d.status !== 'Delivered').length
    : 0;
  const totalPOs = erp ? erp.purchaseOrders.length : 0;
  const vendorScore = erp ? erp.vendorScore : 0;

  return (
    <SignedIn>
      <div className="flex gap-6 p-6">
        <div className="min-w-0 flex-1 space-y-6">
          <DetailHeader
            title={vendor.name}
            subtitle={erp ? `${vendor.category ?? 'Vendor'} · ${vendor.city ?? ''}` : vendor.city ?? undefined}
            backHref="/vendors"
            status={vendor.status}
            metadata={[
              ...(vendor.category ? [{ label: 'Category', value: vendor.category }] : []),
              { label: 'Location', value: `${vendor.city ?? ''}${vendor.state ? `, ${vendor.state}` : ''}` },
              ...(erp ? [{ label: 'Vendor Since', value: new Date(erp.vendorSince).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) }] : []),
            ]}
            metrics={[
              { label: 'Total Spend', value: formatCurrency(totalSpend) },
              { label: 'Purchase Orders', value: String(totalPOs) },
              { label: 'Pending Deliveries', value: String(pendingDeliveries) },
              { label: 'Vendor Score', value: `${vendorScore}/100` },
            ]}
            actions={[
              { label: 'Create PO', icon: <ClipboardList className="h-3.5 w-3.5" />, disabled: true },
              { label: 'Upload Invoice', icon: <FileText className="h-3.5 w-3.5" />, disabled: true },
              { label: 'Add Payment', icon: <CreditCard className="h-3.5 w-3.5" />, disabled: true },
              { label: 'Edit Vendor', icon: <Edit className="h-3.5 w-3.5" />, onClick: handleOpenEdit },
            ]}
          />

          <Tabs defaultValue="overview">
            <TabsList className="flex-wrap">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
              <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <VendorOverviewTab vendor={vendor} erp={erp} />
            </TabsContent>
            <TabsContent value="purchase-orders" className="mt-4">
              <VendorPurchaseOrdersTab purchaseOrders={erp?.purchaseOrders ?? []} />
            </TabsContent>
            <TabsContent value="invoices" className="mt-4">
              <VendorInvoicesTab invoices={erp?.invoices ?? []} />
            </TabsContent>
            <TabsContent value="materials" className="mt-4">
              <VendorMaterialsTab materials={erp?.materials ?? []} />
            </TabsContent>
            <TabsContent value="deliveries" className="mt-4">
              <VendorDeliveriesTab deliveries={erp?.deliveries ?? []} />
            </TabsContent>
            <TabsContent value="performance" className="mt-4">
              {erp ? <VendorPerformanceTab erp={erp} /> : <p className="text-muted-foreground">No performance data available</p>}
            </TabsContent>
            <TabsContent value="documents" className="mt-4">
              <VendorDocumentsTab documents={erp?.documents ?? []} />
            </TabsContent>
            <TabsContent value="activity" className="mt-4">
              <VendorActivityTab activity={erp?.activity ?? []} />
            </TabsContent>
            <TabsContent value="settings" className="mt-4">
              <VendorSettingsTab vendor={vendor} onEdit={handleOpenEdit} onDelete={() => setDeleteOpen(true)} />
            </TabsContent>
          </Tabs>
        </div>

        <aside className="hidden w-72 shrink-0 xl:block">
          <div className="sticky top-6 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <DetailSidebar
              recentActivity={erp?.activity ?? []}
              quickActions={[
                { label: 'Create PO', icon: <ClipboardList className="h-4 w-4" />, disabled: true },
                { label: 'Upload Invoice', icon: <FileText className="h-4 w-4" />, disabled: true },
                { label: 'Add Payment', icon: <CreditCard className="h-4 w-4" />, disabled: true },
              ]}
              relatedRecords={[
                { label: 'Purchase Orders', count: totalPOs },
                { label: 'Invoices', count: erp?.invoices.length ?? 0 },
                { label: 'Materials', count: erp?.materials.length ?? 0 },
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
            <SheetTitle>Edit Vendor</SheetTitle>
            <SheetDescription>Update vendor information.</SheetDescription>
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
              <Label htmlFor="edit-category">Category</Label>
              <Input id="edit-category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="h-11" />
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
                {isSaving ? 'Updating...' : 'Update Vendor'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete vendor?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete &quot;{vendor.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Vendor'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SignedIn>
  );
}
