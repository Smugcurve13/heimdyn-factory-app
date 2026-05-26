'use client';

import type { DocumentEntry } from '@/services/api';
import { formatDate } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText, Upload } from 'lucide-react';

const typeIcons: Record<string, string> = {
  Contract: '📄',
  GST: '🏛️',
  Certificate: '📜',
  Identity: '🪪',
  Finance: '💰',
  Invoice: '🧾',
};

export function DocumentList({ documents }: { documents: DocumentEntry[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Documents</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button variant="outline" size="sm" disabled className="gap-1.5">
                  <Upload className="h-3.5 w-3.5" />
                  Upload Document
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Coming soon</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.name}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{typeIcons[doc.type] ?? '📁'}</span>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{doc.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{doc.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {formatDate(doc.date)}
              </span>
              <FileText className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
