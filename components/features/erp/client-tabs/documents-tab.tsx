'use client';

import type { DocumentEntry } from '@/services/api';
import { DocumentList } from '@/components/features/erp/document-list';

export function ClientDocumentsTab({ documents }: { documents: DocumentEntry[] }) {
  return <DocumentList documents={documents} />;
}
