"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
  mode?: "single";
  initialFocus?: boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// Helper functions
const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isOutsideMonth = (date: Date, month: number): boolean => {
  return date.getMonth() !== month;
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

const getDaysInMonth = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  const endDate = new Date(lastDay);

  // Get the first Sunday of the calendar view
  const startOffset = firstDay.getDay();
  startDate.setDate(startDate.getDate() - startOffset);

  // Get the last Saturday of the calendar view
  const endOffset = 6 - lastDay.getDay();
  endDate.setDate(endDate.getDate() + endOffset);

  const days: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
};

function Calendar({
  className = "",
  selected,
  onSelect,
  disabled,
  initialFocus = false,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    return selected ? new Date(selected.getFullYear(), selected.getMonth(), 1) : new Date();
  });

  const [focusedDate, setFocusedDate] = React.useState<Date | null>(selected || new Date());
  const gridRef = React.useRef<HTMLDivElement>(null);
  const buttonRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days = getDaysInMonth(year, month);

  // Navigation handlers
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateSelect = (date: Date) => {
    if (disabled?.(date)) return;
    if (isOutsideMonth(date, month)) return;
    
    onSelect?.(date);
    setFocusedDate(date);
  };

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, date: Date) => {
    let newFocusedDate: Date | null = null;

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        newFocusedDate = new Date(date);
        newFocusedDate.setDate(newFocusedDate.getDate() - 1);
        break;
      case "ArrowRight":
        event.preventDefault();
        newFocusedDate = new Date(date);
        newFocusedDate.setDate(newFocusedDate.getDate() + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        newFocusedDate = new Date(date);
        newFocusedDate.setDate(newFocusedDate.getDate() - 7);
        break;
      case "ArrowDown":
        event.preventDefault();
        newFocusedDate = new Date(date);
        newFocusedDate.setDate(newFocusedDate.getDate() + 7);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        handleDateSelect(date);
        return;
    }

    if (newFocusedDate) {
      setFocusedDate(newFocusedDate);
      
      // Change month if necessary
      if (newFocusedDate.getMonth() !== month) {
        setCurrentMonth(new Date(newFocusedDate.getFullYear(), newFocusedDate.getMonth(), 1));
      }

      // Focus the new date
      setTimeout(() => {
        const dateKey = newFocusedDate!.toDateString();
        const buttonElement = buttonRefs.current.get(dateKey);
        if (buttonElement) {
          buttonElement.focus();
        }
      }, 0);
    }
  };

  // Set ref for each button
  const setButtonRef = (date: Date, element: HTMLButtonElement | null) => {
    const dateKey = date.toDateString();
    if (element) {
      buttonRefs.current.set(dateKey, element);
    } else {
      buttonRefs.current.delete(dateKey);
    }
  };

  // CSS class helpers
  const getBaseClasses = () => 
    "aspect-square w-full grid place-items-center rounded-lg text-sm md:text-base transition ring-inset";
  
  const getInteractiveClasses = () =>
    "cursor-pointer hover:ring-1 hover:ring-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400";

  const getDayClasses = (date: Date) => {
    const baseClasses = getBaseClasses();
    let classes = [baseClasses];

    const isDisabled = disabled?.(date);
    const isOutside = isOutsideMonth(date, month);
    const isTodayDate = isToday(date);
    const isSelected = selected && isSameDay(date, selected);

    if (isDisabled) {
      classes.push("opacity-40 cursor-not-allowed pointer-events-none");
    } else if (isOutside) {
      classes.push("text-neutral-400/60 opacity-60 pointer-events-none");
    } else {
      classes.push("text-neutral-200");
      classes.push(getInteractiveClasses());
    }

    if (isTodayDate && !isSelected) {
      classes.push("bg-blue-500 text-white font-semibold ring-2 ring-blue-300");
    }

    if (isSelected) {
      classes.push("bg-blue-600 text-white ring-2 ring-blue-300");
    }

    return classes.join(" ");
  };

  return (
    <div className={`p-3 md:p-4 overflow-hidden rounded-xl bg-[#0f1115] ${className}`} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <button
          onClick={goToPreviousMonth}
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous month"
          type="button"
        >
          <ChevronLeft className="h-4 w-4 text-neutral-200" />
        </button>
        
        <h2 className="text-sm md:text-base font-medium text-neutral-100">
          {MONTHS[month]} {year}
        </h2>
        
        <button
          onClick={goToNextMonth}
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next month"
          type="button"
        >
          <ChevronRight className="h-4 w-4 text-neutral-200" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 md:gap-1.5 mb-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-[11px] md:text-xs text-neutral-400 uppercase tracking-wide text-center py-2"
            role="columnheader"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-7 gap-1 md:gap-1.5"
        role="grid"
        aria-label={`Calendar for ${MONTHS[month]} ${year}`}
      >
        {days.map((date, index) => {
          const dateKey = date.toDateString();
          const isFocused = focusedDate && isSameDay(date, focusedDate);
          const isDisabled = disabled?.(date);
          const isOutside = isOutsideMonth(date, month);
          const isSelected = selected && isSameDay(date, selected);
          const isTodayDate = isToday(date);

          return (
            <button
              key={dateKey}
              ref={(el) => setButtonRef(date, el)}
              className={getDayClasses(date)}
              onClick={() => handleDateSelect(date)}
              onKeyDown={(e) => handleKeyDown(e, date)}
              tabIndex={isFocused ? 0 : -1}
              role="gridcell"
              aria-selected={isSelected ? "true" : "false"}
              aria-current={isTodayDate ? "date" : undefined}
              aria-disabled={isDisabled || isOutside}
              disabled={isDisabled}
              type="button"
            >
              <span className="block">
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };