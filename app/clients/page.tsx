'use client'

import { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clientService, type Client } from '@/services/api';

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
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const [viewData, setViewData] = useState<Client | null>(null);
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

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.contact_person || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.city || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleView = (client: Client) => {
    setViewData(client);
    setViewId(client.id);
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
        if (response.success) {
          toast({ title: 'Success', description: 'Client updated' });
        }
      } else {
        const response = await clientService.createClient(formData);
        if (response.success) {
          toast({ title: 'Success', description: 'Client created' });
        }
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
        setClients(clients.filter(c => c.id !== deleteId));
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <SignedIn>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {filteredClients.length} of {clients.length} clients
        </p>

        <div className="flex items-center justify-between">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading clients...</span>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery ? 'No clients found matching your search' : 'No clients found'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow
                      key={client.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleView(client)}
                    >
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.contact_person || '—'}</TableCell>
                      <TableCell>{client.email || '—'}</TableCell>
                      <TableCell>{client.city || '—'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={client.status === 'active' ? 'default' : 'secondary'}
                          className={client.status === 'active' ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400' : ''}
                        >
                          {client.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(client.created_at)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(client)}>
                              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                              View
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
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Sheet */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="w-full sm:max-w-[500px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-xl">{editingId ? 'Edit Client' : 'Add New Client'}</SheetTitle>
              <SheetDescription>
                {editingId ? 'Update client information.' : 'Add a new client to the system.'}
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-6">
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
                <Button type="button" variant="outline" onClick={() => { setIsSheetOpen(false); setFormData(emptyForm); setEditingId(null); }} disabled={isSaving} className="flex-1 h-11">Cancel</Button>
                <Button type="submit" disabled={isSaving} className="flex-1 h-11">
                  {isSaving ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Client' : 'Create Client')}
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>

        {/* View Sheet */}
        <Sheet open={!!viewId} onOpenChange={(open) => { if (!open) { setViewId(null); setViewData(null); } }}>
          <SheetContent className="w-full sm:max-w-[500px] overflow-y-auto">
            {viewData && (
              <>
                <SheetHeader>
                  <div className="flex items-center gap-4 pb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">{viewData.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <SheetTitle className="text-xl">{viewData.name}</SheetTitle>
                      <p className="text-sm text-muted-foreground">{viewData.city}{viewData.state ? `, ${viewData.state}` : ''}</p>
                    </div>
                  </div>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <div className="mt-1">
                        <Badge
                          variant={viewData.status === 'active' ? 'default' : 'secondary'}
                          className={viewData.status === 'active' ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400' : ''}
                        >
                          {viewData.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Created</Label>
                      <p className="text-sm font-medium mt-1">{formatDate(viewData.created_at)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-semibold">Contact Information</Label>
                    {viewData.contact_person && (
                      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                        <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        <span className="text-sm">{viewData.contact_person}</span>
                      </div>
                    )}
                    {viewData.email && (
                      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                        <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                        <span className="text-sm">{viewData.email}</span>
                      </div>
                    )}
                    {viewData.phone && (
                      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                        <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                        <span className="text-sm">{viewData.phone}</span>
                      </div>
                    )}
                  </div>

                  {viewData.address && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Address</Label>
                      <p className="text-sm mt-1">{viewData.address}</p>
                      <p className="text-sm text-muted-foreground">{viewData.city}{viewData.state ? `, ${viewData.state}` : ''}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-6 border-t">
                    <Button
                      variant="outline"
                      className="flex-1 h-11 text-destructive hover:text-destructive"
                      onClick={() => { setViewId(null); setViewData(null); setDeleteId(viewData.id); }}
                    >
                      Delete
                    </Button>
                    <Button
                      className="flex-1 h-11"
                      onClick={() => { setViewId(null); setViewData(null); handleOpenEdit(viewData); }}
                    >
                      Edit Client
                    </Button>
                  </div>
                  <Button variant="ghost" className="w-full h-11" onClick={() => { setViewId(null); setViewData(null); }}>Close</Button>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete the client
                {deleteId && clients.find(c => c.id === deleteId) && ` "${clients.find(c => c.id === deleteId)?.name}"`}.
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
