'use client'

import { useAuth } from './AuthProvider';
import { useRole } from '@/lib/erp/roles';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Archive, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function UserButton() {
  const { user, signOut } = useAuth();
  const { can } = useRole();
  const router = useRouter();

  if (!user) return null;

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            <p className="w-[200px] truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        {can('demo:reset') && (
          <DropdownMenuItem className="cursor-pointer" onSelect={() => router.push('/quotations/rejected')}>
            <Archive className="mr-2 h-4 w-4" />
            Rejected Quotations
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="cursor-pointer" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}