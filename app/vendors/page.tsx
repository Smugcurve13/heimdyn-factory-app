'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SignedIn } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  MoreVertical,
  Search,
  Trash2,
  Edit,
  Loader2,
  Truck,
  UserCheck,
  PackageOpen,
  ClipboardList,
  IndianRupee,
  Crown,
  Upload,
  Boxes,
  Package,
  Wrench,
  Cog,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { vendorService, type Vendor } from '@/services/api';
import { KpiStrip } from '@/components/features/erp/kpi-strip';
import { HealthBadge } from '@/components/features/erp/health-badge';
import { cardShell } from '@/lib/styles';
import {
  getVendorKpiSummary,
  getVendorTableRow,
  formatCurrency,
  formatRelativeDate,
} from '@/lib/mock-data';

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

const categoryCards = [
  { label: 'Raw Materials', icon: <Boxes className="h-5 w-5" />, key: 'Raw Materials' },
  { label: 'Packaging', icon: <Package className="h-5 w-5" />, key: 'Packaging' },
  { label: 'Equipment', icon: <Wrench className="h-5 w-5" />, key: 'Equipment' },
  { label: 'Others', icon: <Cog className="h-5 w-5" />, key: '__others' },
];

export default function VendorsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const { toast } = useToast();

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await vendorService.getVendors();
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({ title: 'Error', description: 'Failed to load vendors', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const kpiSummary = useMemo(() => getVendorKpiSummary(vendors), [vendors]);

  const categoryCounts = useMemo(() => {
    const known = new Set(['Raw Materials', 'Packaging', 'Equipment']);
    const counts: Record<string, number> = { 'Raw Materials': 0, Packaging: 0, Equipment: 0, __others: 0 };
    vendors.forEach((v) => {
      const cat = v.category ?? '';
      if (known.has(cat)) counts[cat]++;
      else counts.__others++;
    });
    return counts;
  }, [vendors]);

  const categories = useMemo(() => {
    const set = new Set(vendors.map((v) => v.category).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [vendors]);

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        (v.contact_person || '').toLowerCase().includes(q) ||
        (v.email || '').toLowerCase().includes(q) ||
        (v.city || '').toLowerCase().includes(q) ||
        (v.category || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || v.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [vendors, searchQuery, statusFilter, categoryFilter]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (vendor: Vendor) => {
    setEditingId(vendor.id);
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
    setIsSheetOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      if (editingId) {
        const response = await vendorService.updateVendor(editingId, formData);
        if (response.success) toast({ title: 'Success', description: 'Vendor updated' });
      } else {
        const response = await vendorService.createVendor(formData);
        if (response.success) toast({ title: 'Success', description: 'Vendor created' });
      }
      setIsSheetOpen(false);
      setFormData(emptyForm);
      setEditingId(null);
      fetchVendors();
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast({ title: 'Error', description: `Failed to ${editingId ? 'update' : 'create'} vendor`, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const response = await vendorService.deleteVendor(deleteId);
      if (response.success) {
        setVendors(vendors.filter((v) => v.id !== deleteId));
        toast({ title: 'Success', description: 'Vendor deleted' });
      }
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast({ title: 'Error', description: 'Failed to delete vendor', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  const kpiItems = [
    { title: 'Total Vendors', value: String(kpiSummary.totalVendors), icon: <Truck className="h-5 w-5" /> },
    { title: 'Active Vendors', value: String(kpiSummary.activeVendors), icon: <UserCheck className="h-5 w-5" /> },
    { title: 'Pending Deliveries', value: String(kpiSummary.pendingDeliveries), icon: <PackageOpen className="h-5 w-5" /> },
    { title: 'Open POs', value: String(kpiSummary.openPOs), icon: <ClipboardList className="h-5 w-5" /> },
    { title: 'Monthly Spend', value: formatCurrency(kpiSummary.monthlySpend), icon: <IndianRupee className="h-5 w-5" /> },
    { title: 'Top Vendor', value: kpiSummary.topVendor || '—', icon: <Crown className="h-5 w-5" /> },
  ];

  return (
    <SignedIn>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage supplier relationships and track procurement activity
          </p>
        </div>

        <KpiStrip items={kpiItems} />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {categoryCards.map((cat) => (
            <div
              key={cat.key}
              className={`${cardShell} flex cursor-pointer items-center gap-4 p-5 transition-shadow hover:shadow-lg`}
              onClick={() => setCategoryFilter(cat.key === '__others' ? 'all' : cat.key)}
            >
              <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400">
                {cat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{cat.label}</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {categoryCounts[cat.key] ?? 0}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendors..."
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button variant="outline" size="sm" disabled className="gap-1.5">
                      <Upload className="h-3.5 w-3.5" />
                      Upload Excel
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Coming soon</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button onClick={handleOpenCreate} size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add Vendor
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading vendors...</span>
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {searchQuery ? 'No vendors found matching your search' : 'No vendors found'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[220px]">Vendor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Materials</TableHead>
                    <TableHead className="text-center">Pending PO</TableHead>
                    <TableHead className="text-right">Total Spend</TableHead>
                    <TableHead>Last Delivery</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead className="w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.map((vendor) => {
                    const row = getVendorTableRow(vendor);
                    return (
                      <TableRow
                        key={vendor.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/vendors/${vendor.id}`)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{vendor.name}</p>
                            {vendor.contact_person && (
                              <p className="text-xs text-muted-foreground">{vendor.contact_person}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {vendor.category ? (
                            <Badge variant="outline">{vendor.category}</Badge>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-center">{row.materials}</TableCell>
                        <TableCell className="text-center">{row.pendingPO}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(row.totalSpend)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {row.lastDelivery ? formatRelativeDate(row.lastDelivery) : '—'}
                        </TableCell>
                        <TableCell>
                          <HealthBadge value={row.performance} />
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/vendors/${vendor.id}`)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenEdit(vendor)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteId(vendor.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Sheet */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="w-full overflow-y-auto sm:max-w-[500px]">
            <SheetHeader>
              <SheetTitle className="text-xl">{editingId ? 'Edit Vendor' : 'Add New Vendor'}</SheetTitle>
              <SheetDescription>
                {editingId ? 'Update vendor information.' : 'Add a new vendor to the system.'}
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Company name" className="h-11" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., Raw Materials, Packaging, Equipment" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input id="contact_person" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} placeholder="Primary contact" className="h-11" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Email address" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Phone number" className="h-11" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Street address" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="City" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} placeholder="State" className="h-11" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => { setIsSheetOpen(false); setFormData(emptyForm); setEditingId(null); }} disabled={isSaving} className="h-11 flex-1">Cancel</Button>
                <Button type="submit" disabled={isSaving} className="h-11 flex-1">
                  {isSaving ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Vendor' : 'Create Vendor')}
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete the vendor
                {deleteId && vendors.find((v) => v.id === deleteId) && ` "${vendors.find((v) => v.id === deleteId)?.name}"`}.
                This action cannot be undone.
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
      </div>
    </SignedIn>
  );
}
