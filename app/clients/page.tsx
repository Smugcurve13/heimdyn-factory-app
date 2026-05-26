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
  Users,
  UserCheck,
  ShoppingCart,
  IndianRupee,
  BarChart3,
  Crown,
  Upload,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { clientService, type Client } from '@/services/api';
import { KpiStrip } from '@/components/features/erp/kpi-strip';
import { InsightCard } from '@/components/features/erp/insight-card';
import { HealthBadge } from '@/components/features/erp/health-badge';
import {
  getClientKpiSummary,
  getClientTableRow,
  getAllClientErpData,
  formatCurrency,
  formatRelativeDate,
} from '@/lib/mock-data';

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

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const { toast } = useToast();

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await clientService.getClients();
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({ title: 'Error', description: 'Failed to load clients', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const kpiSummary = useMemo(() => getClientKpiSummary(clients), [clients]);

  const allErp = useMemo(() => getAllClientErpData(), []);
  const insights = useMemo(() => {
    const withRevenue = clients.map((c) => {
      const erp = allErp[c.name];
      const revenue = erp ? erp.orders.reduce((s, o) => s + o.amount, 0) : 0;
      const orders = erp ? erp.orders.length : 0;
      return { ...c, revenue, orders };
    });
    const sorted = [...withRevenue].sort((a, b) => b.revenue - a.revenue);
    const byCdate = [...withRevenue].sort((a, b) => b.created_at.localeCompare(a.created_at));

    return {
      top: sorted.filter((c) => c.status === 'active').slice(0, 4).map((c) => ({ name: c.name, revenue: c.revenue, orders: c.orders })),
      recent: byCdate.slice(0, 4).map((c) => ({ name: c.name, revenue: c.revenue, orders: c.orders })),
      highRevenue: sorted.filter((c) => c.revenue > 200000).slice(0, 4).map((c) => ({ name: c.name, revenue: c.revenue, orders: c.orders })),
      inactive: withRevenue.filter((c) => c.status === 'inactive').slice(0, 4).map((c) => ({ name: c.name, revenue: c.revenue, orders: c.orders })),
    };
  }, [clients, allErp]);

  const cities = useMemo(() => {
    const set = new Set(clients.map((c) => c.city).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.contact_person || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.city || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesCity = cityFilter === 'all' || c.city === cityFilter;
      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [clients, searchQuery, statusFilter, cityFilter]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingId(client.id);
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
        const response = await clientService.updateClient(editingId, formData);
        if (response.success) toast({ title: 'Success', description: 'Client updated' });
      } else {
        const response = await clientService.createClient(formData);
        if (response.success) toast({ title: 'Success', description: 'Client created' });
      }
      setIsSheetOpen(false);
      setFormData(emptyForm);
      setEditingId(null);
      fetchClients();
    } catch (error) {
      console.error('Error saving client:', error);
      toast({ title: 'Error', description: `Failed to ${editingId ? 'update' : 'create'} client`, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const response = await clientService.deleteClient(deleteId);
      if (response.success) {
        setClients(clients.filter((c) => c.id !== deleteId));
        toast({ title: 'Success', description: 'Client deleted' });
      }
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({ title: 'Error', description: 'Failed to delete client', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  const kpiItems = [
    { title: 'Total Clients', value: String(kpiSummary.totalClients), icon: <Users className="h-5 w-5" /> },
    { title: 'Active Clients', value: String(kpiSummary.activeClients), icon: <UserCheck className="h-5 w-5" /> },
    { title: 'Pending Orders', value: String(kpiSummary.pendingOrders), icon: <ShoppingCart className="h-5 w-5" /> },
    { title: 'Revenue This Month', value: formatCurrency(kpiSummary.revenueThisMonth), icon: <IndianRupee className="h-5 w-5" /> },
    { title: 'Avg Order Value', value: formatCurrency(kpiSummary.avgOrderValue), icon: <BarChart3 className="h-5 w-5" /> },
    { title: 'Top Customer', value: kpiSummary.topCustomer || '—', icon: <Crown className="h-5 w-5" /> },
  ];

  return (
    <SignedIn>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage customer relationships and track business activity
          </p>
        </div>

        <KpiStrip items={kpiItems} />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InsightCard title="Top Customers" items={insights.top} />
          <InsightCard title="Recently Added" items={insights.recent} />
          <InsightCard title="High Revenue" items={insights.highRevenue} />
          <InsightCard title="Inactive Customers" items={insights.inactive} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients..."
                className="pl-9"
              />
            </div>
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
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
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
              Add Client
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading clients...</span>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {searchQuery ? 'No clients found matching your search' : 'No clients found'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[220px]">Customer</TableHead>
                    <TableHead className="text-center">Orders</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead>Last Purchase</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead className="w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => {
                    const row = getClientTableRow(client);
                    return (
                      <TableRow
                        key={client.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/clients/${client.id}`)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{client.name}</p>
                            {client.contact_person && (
                              <p className="text-xs text-muted-foreground">{client.contact_person}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{row.orders}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(row.revenue)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {row.lastPurchase ? formatRelativeDate(row.lastPurchase) : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.outstanding > 0 ? formatCurrency(row.outstanding) : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={client.status === 'active' ? 'default' : 'secondary'}
                            className={
                              client.status === 'active'
                                ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400'
                                : ''
                            }
                          >
                            {client.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <HealthBadge value={row.health} />
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/clients/${client.id}`)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenEdit(client)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteId(client.id)}
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
              <SheetTitle className="text-xl">{editingId ? 'Edit Client' : 'Add New Client'}</SheetTitle>
              <SheetDescription>
                {editingId ? 'Update client information.' : 'Add a new client to the system.'}
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Company name" className="h-11" required />
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
                  {isSaving ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Client' : 'Create Client')}
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
                This will delete the client
                {deleteId && clients.find((c) => c.id === deleteId) && ` "${clients.find((c) => c.id === deleteId)?.name}"`}.
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
                {isDeleting ? 'Deleting...' : 'Delete Client'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SignedIn>
  );
}
