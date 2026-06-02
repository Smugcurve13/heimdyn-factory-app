import { ModulePlaceholder } from '@/components/erp/ModulePlaceholder';

export default function SalesOrdersPage() {
  return (
    <ModulePlaceholder
      title="Sales Orders"
      phase="Phase 4"
      description="Confirmed business, always system-created. Tracks Confirmed → Stock Committed → Dispatched → Invoiced."
    />
  );
}
