import * as React from "react";
// NOTE: This component is deprecated. Use @/components/calendar instead.
// Redirecting to the new custom calendar component.
import { Calendar as CustomCalendar } from "@/components/calendar";

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
  mode?: "single";
  initialFocus?: boolean;
}

function Calendar(props: CalendarProps) {
  // Redirect to the new custom calendar component
  return <CustomCalendar {...props} />;
}

Calendar.displayName = "Calendar";

export { Calendar };
