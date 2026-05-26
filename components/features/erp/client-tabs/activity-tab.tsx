'use client';

import type { ActivityEntry } from '@/services/api';
import { ActivityTimeline } from '@/components/features/erp/activity-timeline';

export function ClientActivityTab({ activity }: { activity: ActivityEntry[] }) {
  return <ActivityTimeline entries={activity} />;
}
