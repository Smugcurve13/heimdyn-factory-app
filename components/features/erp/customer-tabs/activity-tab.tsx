'use client';

import type { ActivityEntry } from '@/services/api';
import { ActivityTimeline } from '@/components/features/erp/activity-timeline';

export function CustomerActivityTab({ activity }: { activity: ActivityEntry[] }) {
  return <ActivityTimeline entries={activity} />;
}
