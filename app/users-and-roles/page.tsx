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
  CardDescription,
  CardHeader,
  CardTitle,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  MoreVertical,
  UserPlus,
  Search,
  Trash2,
  Edit,
  X,
  LayoutDashboard,
  Factory,
  Package,
  TrendingUp,
  Activity,
  Users as UsersIcon,
  Shield,
  Truck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { userService, type Role } from '@/services/api';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  roleName: string;
  createdAt: Date;
  lastLogin: string | null;
  isActive: boolean;
}

const getRoleBadgeVariant = (role: string) => {
  const roleLower = role?.toLowerCase() || '';
  if (roleLower.includes('admin')) return 'default';
  if (roleLower.includes('manager')) return 'secondary';
  if (roleLower.includes('operator')) return 'outline';
  return 'outline';
};

const getStatusBadgeVariant = (isActive: boolean) => {
  return isActive ? 'default' : 'secondary';
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace(',', ',');
};

const getModuleIcon = (moduleName: string) => {
  const normalizedName = moduleName.toLowerCase().replace(/_/g, ' ');

  switch (normalizedName) {
    case 'dashboard':
      return LayoutDashboard;
    case 'production':
      return Factory;
    case 'material':
      return Package;
    case 'sales':
      return TrendingUp;
    case 'analysis':
      return Activity;
    case 'customers':
      return UsersIcon;
    case 'vendors':
      return Truck;
    case 'users':
      return UsersIcon;
    case 'roles':
      return Shield;
    default:
      return LayoutDashboard;
  }
};

interface RoleWithStats {
  id: number;
  name: string;
  userCount: number;
  apiPermissions?: {
    [key: string]: string[];
  };
  permissions: {
    category: string;
    access: 'full' | 'partial' | 'none';
    granted: number;
    total: number;
  }[];
  totalGranted: number;
  totalPossible: number;
}

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesWithStats, setRolesWithStats] = useState<RoleWithStats[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [viewUserData, setViewUserData] = useState<User | null>(null);
  const [viewRoleId, setViewRoleId] = useState<number | null>(null);
  const [viewRoleData, setViewRoleData] = useState<RoleWithStats | null>(null);
  const [roleViewTab, setRoleViewTab] = useState<'permissions' | 'users'>('permissions');
  const [newRoleName, setNewRoleName] = useState('');
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [availablePermissions, setAvailablePermissions] = useState<{ [key: string]: string[] }>({});
  const [selectedPermissions, setSelectedPermissions] = useState<{ [key: string]: string[] }>({});
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    role: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Debug: Log formData changes
  useEffect(() => {
    console.log('FormData changed:', formData);
  }, [formData]);

  // Calculate roles with statistics
  useEffect(() => {
    if (roles.length > 0 && users.length > 0) {
      // Find superadmin role to determine total possible permissions
      const superadminRole = roles.find(r => r.name.toLowerCase() === 'superadmin');
      let totalPossible = 0;
      let totalUsersPermissions = 0;
      
      if (superadminRole && superadminRole.permissions) {
        // Count total permissions from superadmin
        Object.values(superadminRole.permissions).forEach(perms => {
          totalPossible += perms.length;
        });
        // Get total permissions for "users" module specifically
        if (superadminRole.permissions.users) {
          totalUsersPermissions = superadminRole.permissions.users.length;
        }
      }
      
      const enrichedRoles: RoleWithStats[] = roles.map(role => {
        const userCount = users.filter(user => user.role === role.name).length;
        
        // Calculate permissions from API data
        let totalGranted = 0;
        const permissionCategories: { [key: string]: number } = {};
        
        if (role.permissions) {
          // Count total granted permissions across all categories
          Object.entries(role.permissions).forEach(([category, perms]) => {
            totalGranted += perms.length;
            permissionCategories[category] = perms.length;
          });
        }
        
        // Create permission summary - only show User Management if role has "users" permissions
        const permissions = [];
        
        if (role.permissions && role.permissions.users && role.permissions.users.length > 0) {
          const usersGranted = role.permissions.users.length;
          permissions.push({
            category: 'User Management',
            access: usersGranted === totalUsersPermissions ? 'full' as const : 'partial' as const,
            granted: usersGranted,
            total: totalUsersPermissions,
          });
        }

        return {
          id: role.id,
          name: role.name,
          userCount,
          apiPermissions: role.permissions,
          permissions,
          totalGranted, // Add this for the card display
          totalPossible, // Add this for the card display
        };
      });
      
      setRolesWithStats(enrichedRoles);
    }
  }, [roles, users]);

  // Fetch roles function
  const fetchRoles = useCallback(async () => {
    setLoadingRoles(true);
    try {
      const response = await userService.getRoles();
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load roles',
        variant: 'destructive',
      });
    } finally {
      setLoadingRoles(false);
    }
  }, [toast]);

  // Fetch permissions function
  const fetchPermissions = async () => {
    setLoadingPermissions(true);
    try {
      const response = await userService.getPermissions();
      const permissions = response || {};
      console.log('Fetched permissions:', permissions);
      setAvailablePermissions(permissions);
      // Initialize selected permissions as empty
      const emptyPermissions: { [key: string]: string[] } = {};
      Object.keys(permissions).forEach(module => {
        emptyPermissions[module] = [];
      });
      setSelectedPermissions(emptyPermissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setAvailablePermissions({});
      setSelectedPermissions({});
      toast({
        title: 'Error',
        description: 'Failed to load permissions',
        variant: 'destructive',
      });
    } finally {
      setLoadingPermissions(false);
    }
  };

  // Helper function to format module names
  const formatModuleName = (module: string): string => {
    const nameMap: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'production': 'Production',
      'material': 'Material',
      'sales': 'Sales',
      'analysis': 'Analysis',
      'customers': 'Customers',
      'vendors': 'Vendors',
      'users': 'Users',
      'roles': 'Roles',
    };
    return nameMap[module] || module.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper function to format permission names
  const formatPermissionName = (perm: string): string => {
    const permMap: { [key: string]: string } = {
      'c': 'Create',
      'r': 'Read',
      'u': 'Update',
      'd': 'Delete',
    };
    return permMap[perm] || perm;
  };

  // Toggle permission selection
  const togglePermission = (module: string, permission: string) => {
    setSelectedPermissions(prev => {
      const modulePerms = prev[module] || [];
      const isSelected = modulePerms.includes(permission);
      
      return {
        ...prev,
        [module]: isSelected 
          ? modulePerms.filter(p => p !== permission)
          : [...modulePerms, permission]
      };
    });
  };

  // Check if permission is selected
  const isPermissionSelected = (module: string, permission: string): boolean => {
    return selectedPermissions[module]?.includes(permission) || false;
  };

  // Fetch roles and users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await userService.getUsers();
        // Ensure data is an array
        const usersData = Array.isArray(response.data) ? response.data : [response.data];
        const formattedUsers: User[] = usersData.map(user => ({
          id: user.id.toString(),
          email: user.email,
          username: user.username,
          role: user.role,
          roleName: user.role,
          createdAt: new Date(user.created_at),
          lastLogin: user.last_login,
          isActive: user.is_active,
        }));
        setUsers(formattedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Failed to load users',
          variant: 'destructive',
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchRoles();
    fetchUsers();
  }, [toast, fetchRoles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For edit mode, password is optional
    if (editingUserId) {
      if (!formData.email || !formData.username || !formData.role) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }
    } else {
      // For create mode, all fields required
      if (!formData.email || !formData.username || !formData.password || !formData.role) {
        toast({
          title: 'Error',
          description: 'Please fill in all fields',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      if (editingUserId) {
        // Edit existing user
        const response = await userService.editUser({
          user_id: parseInt(editingUserId),
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });

        if (response.success) {
          // Refetch users to ensure data consistency
          const usersResponse = await userService.getUsers();
          const usersData = Array.isArray(usersResponse.data) ? usersResponse.data : [usersResponse.data];
          const formattedUsers: User[] = usersData.map(user => ({
            id: user.id.toString(),
            email: user.email,
            username: user.username,
            role: user.role,
            roleName: user.role,
            createdAt: new Date(user.created_at),
            lastLogin: user.last_login,
            isActive: user.is_active,
          }));
          setUsers(formattedUsers);

          setFormData({ email: '', username: '', password: '', role: '' });
          setEditingUserId(null);
          setIsDialogOpen(false);

          toast({
            title: 'Success',
            description: response.message || 'User updated successfully',
          });
        }
      } else {
        // Create new user
        const response = await userService.createUser({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });

        if (response.success) {
          // Refetch to get complete user data
          const usersResponse = await userService.getUsers();
          const usersData = Array.isArray(usersResponse.data) ? usersResponse.data : [usersResponse.data];
          const formattedUsers: User[] = usersData.map(user => ({
            id: user.id.toString(),
            email: user.email,
            username: user.username,
            role: user.role,
            roleName: user.role,
            createdAt: new Date(user.created_at),
            lastLogin: user.last_login,
            isActive: user.is_active,
          }));
          setUsers(formattedUsers);
          
          setFormData({ email: '', username: '', password: '', role: '' });
          setIsDialogOpen(false);

          toast({
            title: 'Success',
            description: response.message || 'User created successfully',
          });
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Error',
        description: `Failed to ${editingUserId ? 'update' : 'create'} user. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (userId: string) => {
    console.log('Edit user clicked for ID:', userId);
    setLoadingUserData(true);
    setEditingUserId(userId); // Set editing mode immediately
    
    try {
      const response = await userService.getUsers(parseInt(userId));
      
      console.log('Full API response:', response);
      console.log('Response data:', response.data);
      
      // Handle both array and single object responses
      let userData;
      if (Array.isArray(response.data)) {
        userData = response.data[0];
      } else {
        userData = response.data;
      }
      
      if (userData) {
        console.log('User data to populate:', userData);
        
        const newFormData = {
          email: userData.email,
          username: userData.username,
          password: '', // Leave password blank for editing
          role: userData.role ?? '',
        };
        
        console.log('Setting form data to:', newFormData);
        setFormData(newFormData);
      } else {
        console.warn('No user data found in response');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setEditingUserId(null); // Reset on error
      toast({
        title: 'Error',
        description: 'Failed to load user data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingUserData(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setFormData({ email: '', username: '', password: '', role: '' });
    setIsDialogOpen(false);
  };

  const handleOpenDialog = (userId?: string) => {
    if (userId) {
      handleEditUser(userId);
    } else {
      setEditingUserId(null);
      setFormData({ email: '', username: '', password: '', role: '' });
    }
    setIsDialogOpen(true);
  };

  const handleViewUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setViewUserData(user);
      setViewUserId(userId);
    }
  };

  const handleCloseViewUser = () => {
    setViewUserId(null);
    setViewUserData(null);
  };

  const handleViewRole = (roleId: number) => {
    const role = rolesWithStats.find(r => r.id === roleId);
    if (role) {
      setViewRoleData(role);
      setViewRoleId(roleId);
      setRoleViewTab('permissions');
    }
  };

  const handleCloseViewRole = () => {
    setViewRoleId(null);
    setViewRoleData(null);
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.roleName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    
    setIsDeleting(true);
    try {
      const response = await userService.deleteUser({
        user_id: parseInt(deleteUserId),
      });

      if (response.success) {
        setUsers(users.filter(user => user.id !== deleteUserId));
        toast({
          title: 'Success',
          description: response.message || 'User deleted successfully',
        });
        setDeleteUserId(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEditRole = (roleId: number) => {
    // Find the role data
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    // Set editing mode
    setEditingRoleId(roleId);
    setNewRoleName(role.name);
    
    // Fetch permissions first
    fetchPermissions().then(() => {
      // Prefill selected permissions from existing role
      const prefillPermissions: { [key: string]: string[] } = {};
      if (role.permissions) {
        Object.entries(role.permissions).forEach(([module, perms]) => {
          prefillPermissions[module] = perms;
        });
      }
      setSelectedPermissions(prefillPermissions);
      
      // Close view sheet and open edit dialog
      setViewRoleId(null);
      setIsRoleDialogOpen(true);
    });
  };

  const handleSaveRole = async () => {
    if (!newRoleName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a role name',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingRole(true);
    try {
      // Format permissions: convert array of permissions to comma-separated string
      const formattedPermissions: { [key: string]: string } = {};
      Object.entries(selectedPermissions).forEach(([module, perms]) => {
        if (perms.length > 0) {
          formattedPermissions[module] = perms.join(',');
        }
      });

      const response = await userService.manageRole({
        action: editingRoleId ? 'edit' : 'create',
        role_id: editingRoleId || undefined,
        name: newRoleName.trim(),
        permissions: Object.keys(formattedPermissions).length > 0 ? formattedPermissions : undefined,
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || (editingRoleId ? 'Role updated successfully' : 'Role created successfully'),
        });
        setNewRoleName('');
        setEditingRoleId(null);
        setIsRoleDialogOpen(false);
        // Reset selected permissions
        const emptyPermissions: { [key: string]: string[] } = {};
        if (availablePermissions) {
          Object.keys(availablePermissions).forEach(module => {
            emptyPermissions[module] = [];
          });
        }
        setSelectedPermissions(emptyPermissions);
        // Refresh roles list
        fetchRoles();
      }
    } catch (error) {
      console.error('Error creating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to create role. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingRole(false);
    }
  };

  return (
    <SignedIn>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users & Roles</h1>
        </div>

        {/* Count Display */}
        <p className="text-sm text-muted-foreground">
          {activeTab === 'users' 
            ? `Showing ${filteredUsers.length} of ${users.length} users`
            : `Showing ${rolesWithStats.length} of ${rolesWithStats.length} roles`
          }
        </p>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              {activeTab === 'users' ? (
                <>
                  {/* Search Bar */}
                  <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Add User Button */}
                  <Button onClick={() => handleOpenDialog()} className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add User
                  </Button>
                </>
              ) : (
                /* Create Role Button */
                <Button onClick={() => {
                  setIsRoleDialogOpen(true);
                  fetchPermissions();
                }} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Role
                </Button>
              )}
            </div>
          </div>

          {/* Users Tab Content */}
          <TabsContent value="users" className="mt-0">
            <Card>
              <CardContent className="p-0">
                {loadingUsers ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Loading users...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {searchQuery ? 'No users found matching your search' : 'No users found'}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow 
                          key={user.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleViewUser(user.id)}
                        >
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(user.roleName)}>
                              {user.roleName ? user.roleName.charAt(0).toUpperCase() + user.roleName.slice(1) : 'No Role'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(user.lastLogin)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getStatusBadgeVariant(user.isActive)}
                              className={user.isActive ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400' : ''}
                            >
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewUser(user.id)}>
                                  <svg
                                    className="mr-2 h-4 w-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenDialog(user.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setDeleteUserId(user.id)}
                                  disabled={user.roleName?.toLowerCase().includes('admin')}
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
          </TabsContent>

          {/* Roles Tab Content */}
          <TabsContent value="roles" className="mt-0">
            {loadingRoles ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading roles...
              </div>
            ) : rolesWithStats.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No roles found
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {rolesWithStats.map((role) => {
                  // Use totalGranted and totalPossible from the role object
                  const permissionPercentage = role.totalPossible > 0 
                    ? Math.round((role.totalGranted / role.totalPossible) * 100) 
                    : 0;

                  return (
                    <Card key={role.id} className="overflow-hidden">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-xl">{role.name}</CardTitle>
                            <CardDescription>
                              {role.name} Role
                            </CardDescription>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {role.userCount} users
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Permissions Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Permissions</span>
                            <span className="text-muted-foreground">
                              {permissionPercentage}% ({role.totalGranted}/{role.totalPossible})
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${permissionPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Permission Categories */}
                        <div className="space-y-2">
                          {role.permissions.map((permission, index) => (
                            <div key={index} className="flex items-center justify-between py-2">
                              <div className="flex items-center gap-2 text-sm">
                                <div className="h-4 w-4 text-muted-foreground">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                  </svg>
                                </div>
                                <span>{permission.category}</span>
                              </div>
                              <Badge
                                variant={
                                  permission.access === 'full'
                                    ? 'default'
                                    : permission.access === 'partial'
                                    ? 'secondary'
                                    : 'outline'
                                }
                                className={
                                  permission.access === 'full'
                                    ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400'
                                    : permission.access === 'none'
                                    ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400'
                                    : ''
                                }
                              >
                                {permission.access === 'full'
                                  ? 'Full Access'
                                  : permission.access === 'partial'
                                  ? 'Partial Access'
                                  : 'No Access'}
                              </Badge>
                            </div>
                          ))}
                        </div>

                        {/* View Details Button */}
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between group"
                          onClick={() => handleViewRole(role.id)}
                        >
                          <span>View Details</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-transform group-hover:translate-x-1"
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Add/Edit User Sheet */}
        <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <SheetContent className="w-full sm:max-w-[500px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-xl">
                {editingUserId ? 'Edit User' : 'Add New User'}
              </SheetTitle>
              <SheetDescription>
                {editingUserId 
                  ? 'Update user information and role permissions.'
                  : 'Create a new user account and assign permissions.'
                }
              </SheetDescription>
            </SheetHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              {loadingUserData ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading user data...
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter first name"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      disabled={loadingUserData}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={loadingUserData}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password {!editingUserId && <span className="text-destructive">*</span>}
                      {editingUserId && <span className="text-xs text-muted-foreground ml-1">(leave blank to keep current)</span>}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={editingUserId ? "Enter new password (optional)" : "Enter password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUserId}
                      disabled={loadingUserData}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium">
                      Role <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                      disabled={loadingUserData}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={loadingRoles ? "Loading roles..." : "Select a role"} />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.name}>
                            {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      The role determines what permissions the user will have.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancelEdit}
                      disabled={isLoading || loadingUserData}
                      className="flex-1 h-11"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isLoading || loadingRoles || loadingUserData}
                      className="flex-1 h-11"
                    >
                      {isLoading 
                        ? (editingUserId ? 'Updating...' : 'Creating...') 
                        : (editingUserId ? 'Update User' : 'Create User')
                      }
                    </Button>
                  </div>
                </>
              )}
            </form>
          </SheetContent>
        </Sheet>

        {/* Create/Edit Role Sheet */}
        <Sheet open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <SheetContent className="w-full sm:max-w-[500px] flex flex-col">
            <SheetHeader>
              <SheetTitle className="text-xl">{editingRoleId ? 'Edit Role' : 'Create New Role'}</SheetTitle>
              <SheetDescription>
                {editingRoleId ? 'Update role information and permissions' : 'Create a new role with specific permissions'}
              </SheetDescription>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto space-y-6 mt-6 pr-1">
              <div className="space-y-2">
                <Label htmlFor="roleName" className="text-sm font-medium">
                  Role Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="roleName"
                  type="text"
                  placeholder="Enter role name"
                  className="h-11"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Permissions</Label>
                {loadingPermissions ? (
                  <div className="rounded-lg border p-4 text-sm text-muted-foreground text-center">
                    Loading permissions...
                  </div>
                ) : !availablePermissions || Object.keys(availablePermissions).length === 0 ? (
                  <div className="rounded-lg border p-4 text-sm text-muted-foreground text-center">
                    No permissions available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(availablePermissions).map(([module, permissions]) => (
                      <div key={module} className="space-y-3">
                        <h4 className="font-semibold text-sm">{formatModuleName(module)}</h4>
                        <div className="grid grid-cols-3 gap-3">
                          {permissions.map((perm) => (
                            <div key={`${module}-${perm}`} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${module}-${perm}`}
                                checked={isPermissionSelected(module, perm)}
                                onCheckedChange={() => togglePermission(module, perm)}
                              />
                              <label
                                htmlFor={`${module}-${perm}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {formatPermissionName(perm)}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setNewRoleName('');
                  setEditingRoleId(null);
                  setIsRoleDialogOpen(false);
                  // Reset selected permissions
                  const emptyPermissions: { [key: string]: string[] } = {};
                  if (availablePermissions) {
                    Object.keys(availablePermissions).forEach(module => {
                      emptyPermissions[module] = [];
                    });
                  }
                  setSelectedPermissions(emptyPermissions);
                }}
                className="flex-1 h-11"
                disabled={isCreatingRole}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={handleSaveRole}
                className="flex-1 h-11"
                disabled={isCreatingRole}
              >
                {isCreatingRole ? (editingRoleId ? 'Updating...' : 'Creating...') : (editingRoleId ? 'Update Role' : 'Create Role')}
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* View Role Details Sheet */}
        <Sheet open={!!viewRoleId} onOpenChange={(open) => !open && handleCloseViewRole()}>
          <SheetContent className="w-full sm:max-w-[500px] overflow-y-auto">
            {viewRoleData && (
              <>
                <SheetHeader>
                  <div className="flex items-center gap-4 pb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <SheetTitle className="text-xl">{viewRoleData.name}</SheetTitle>
                      <p className="text-sm text-muted-foreground">{viewRoleData.name} Role</p>
                    </div>
                  </div>
                </SheetHeader>

                {/* Tabs */}
                <Tabs value={roleViewTab} onValueChange={(val) => setRoleViewTab(val as 'permissions' | 'users')} className="mt-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="users">Users ({viewRoleData.userCount})</TabsTrigger>
                  </TabsList>

                  {/* Permissions Tab */}
                  <TabsContent value="permissions" className="space-y-3 mt-4">
                    {viewRoleData.apiPermissions && Object.keys(viewRoleData.apiPermissions).length > 0 ? (
                      Object.entries(viewRoleData.apiPermissions).map(([module, permissions]) => {
                        const ModuleIcon = getModuleIcon(module);
                        return (
                        <div key={module} className="rounded-lg border bg-card p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <ModuleIcon className="h-4 w-4 text-foreground" />
                            <h3 className="font-medium text-sm capitalize">
                              {module.replace(/_/g, ' ')}
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {permissions.includes('c') && (
                              <div className="flex items-center gap-1.5">
                                <svg
                                  className="h-4 w-4 text-green-500"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="m9 12 2 2 4-4" />
                                </svg>
                                <span className="text-sm">Create</span>
                              </div>
                            )}
                            {permissions.includes('r') && (
                              <div className="flex items-center gap-1.5">
                                <svg
                                  className="h-4 w-4 text-green-500"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="m9 12 2 2 4-4" />
                                </svg>
                                <span className="text-sm">Read</span>
                              </div>
                            )}
                            {permissions.includes('u') && (
                              <div className="flex items-center gap-1.5">
                                <svg
                                  className="h-4 w-4 text-green-500"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="m9 12 2 2 4-4" />
                                </svg>
                                <span className="text-sm">Update</span>
                              </div>
                            )}
                            {permissions.includes('d') && (
                              <div className="flex items-center gap-1.5">
                                <svg
                                  className="h-4 w-4 text-green-500"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="m9 12 2 2 4-4" />
                                </svg>
                                <span className="text-sm">Delete</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                      })
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No permissions assigned to this role
                      </div>
                    )}
                  </TabsContent>

                  {/* Users Tab */}
                  <TabsContent value="users" className="space-y-3 mt-4">
                    {users.filter(u => u.role === viewRoleData.name).length > 0 ? (
                      users.filter(u => u.role === viewRoleData.name).map((user) => (
                        <div 
                          key={user.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            handleCloseViewRole();
                            handleViewUser(user.id);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{user.username}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <Badge 
                            variant={getStatusBadgeVariant(user.isActive)}
                            className={user.isActive ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400' : ''}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No users assigned to this role
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-11"
                    onClick={handleCloseViewRole}
                  >
                    Close
                  </Button>
                  <Button 
                    className="flex-1 h-11"
                    onClick={() => handleOpenEditRole(viewRoleData.id)}
                  >
                    Edit Role
                  </Button>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* View User Sheet */}
        <Sheet open={!!viewUserId} onOpenChange={(open) => !open && handleCloseViewUser()}>
          <SheetContent className="w-full sm:max-w-[500px] overflow-y-auto">
            {viewUserData && (
              <>
                <SheetHeader>
                  <div className="flex items-center gap-4 pb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <SheetTitle className="text-xl">{viewUserData.username}</SheetTitle>
                      <p className="text-sm text-muted-foreground">{viewUserData.email}</p>
                    </div>
                  </div>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                  {/* Role and Status Section */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Role</Label>
                      <div className="mt-1">
                        <Badge variant={getRoleBadgeVariant(viewUserData.roleName)}>
                          {viewUserData.roleName ? viewUserData.roleName.charAt(0).toUpperCase() + viewUserData.roleName.slice(1) : 'No Role'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <div className="mt-1">
                        <Badge 
                          variant={getStatusBadgeVariant(viewUserData.isActive)}
                          className={viewUserData.isActive ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400' : ''}
                        >
                          {viewUserData.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Last Active */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Last Active</Label>
                    <p className="text-sm font-medium mt-1">{formatDate(viewUserData.lastLogin)}</p>
                  </div>

                  {/* Contact Information Section */}
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold">Contact Information</Label>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                      <svg
                        className="h-4 w-4 text-muted-foreground"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      <span className="text-sm">{viewUserData.email}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-6 border-t">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-11 text-destructive hover:text-destructive"
                      onClick={() => {
                        handleCloseViewUser();
                        setDeleteUserId(viewUserData.id);
                      }}
                    >
                      Delete User
                    </Button>
                    <Button 
                      variant="default" 
                      className="flex-1 h-11"
                      onClick={() => {
                        handleCloseViewUser();
                        handleOpenDialog(viewUserData.id);
                      }}
                    >
                      Edit User
                    </Button>
                  </div>

                  <Button 
                    variant="ghost" 
                    className="w-full h-11"
                    onClick={handleCloseViewUser}
                  >
                    Close
                  </Button>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Delete User Confirmation Dialog */}
        <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user
                {deleteUserId && users.find(u => u.id === deleteUserId) && 
                  ` "${users.find(u => u.id === deleteUserId)?.username}"`
                } and remove their data from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteUser();
                }}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Deleting...' : 'Delete User'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SignedIn>
  );
}