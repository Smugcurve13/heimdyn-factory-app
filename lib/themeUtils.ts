/**
 * Theme utility functions for consistent styling across components
 * Provides reusable classes and utilities for theme-aware components
 */

/**
 * Standard theme-aware classes for metric cards/widgets
 */
export const themeClasses = {
  // Card containers
  card: 'bg-card rounded-lg p-4 border border-border',
  cardHeader: 'bg-card rounded-t-lg px-4 pt-4 pb-2 border-t border-l border-r border-border',
  cardContent: 'bg-card rounded-b-lg px-4 pb-4 border-b border-l border-r border-border',
  
  // Text styles
  title: 'text-sm font-medium text-muted-foreground',
  subtitle: 'text-xs text-muted-foreground',
  primaryValue: 'text-3xl font-bold text-foreground',
  secondaryValue: 'text-base font-semibold text-foreground',
  label: 'text-sm text-foreground',
  
  // Status colors with theme variants
  status: {
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400', 
    error: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
    default: 'text-foreground'
  },
  
  // Background variants for status
  statusBg: {
    success: 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    error: 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800', 
    info: 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    default: 'bg-card border-border'
  }
} as const;

/**
 * Generate status color class based on status string
 */
export const getStatusColor = (status: string): string => {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '');
  
  switch (normalizedStatus) {
    case 'open':
    case 'active':
    case 'running':
    case 'online':
    case 'good':
      return themeClasses.status.success;
    case 'inprogress':
    case 'pending':
    case 'warning':
    case 'medium':
      return themeClasses.status.warning;
    case 'closed':
    case 'error':
    case 'failed':
    case 'offline':
    case 'high':
    case 'critical':
      return themeClasses.status.error;
    case 'info':
    case 'low':
      return themeClasses.status.info;
    default:
      return themeClasses.status.default;
  }
};

/**
 * Generate theme-aware legend dot color
 */
export const getLegendDotColor = (): string => 'bg-foreground';

/**
 * Utility to combine theme classes with custom classes
 */
export const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};