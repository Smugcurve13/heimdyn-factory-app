'use client';

import type { Client } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit, UserCog, CreditCard, Ban, Trash2 } from 'lucide-react';

export function ClientSettingsTab({
  client,
  onEdit,
  onDelete,
}: {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const actions = [
    { label: 'Edit Client', icon: <Edit className="h-4 w-4" />, onClick: onEdit, disabled: false },
    { label: 'Assign Account Manager', icon: <UserCog className="h-4 w-4" />, disabled: true },
    { label: 'Change Credit Limit', icon: <CreditCard className="h-4 w-4" />, disabled: true },
    { label: 'Deactivate Client', icon: <Ban className="h-4 w-4" />, disabled: true },
    { label: 'Delete Client', icon: <Trash2 className="h-4 w-4" />, onClick: onDelete, disabled: false, destructive: true },
  ];

  return (
    <div className="max-w-md space-y-3">
      <TooltipProvider>
        {actions.map((action) => (
          <div key={action.label}>
            {action.disabled ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="block">
                    <Button variant="outline" disabled className="w-full justify-start gap-3">
                      {action.icon}
                      {action.label}
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Coming soon</TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant={action.destructive ? 'destructive' : 'outline'}
                onClick={action.onClick}
                className="w-full justify-start gap-3"
              >
                {action.icon}
                {action.label}
              </Button>
            )}
          </div>
        ))}
      </TooltipProvider>
    </div>
  );
}
