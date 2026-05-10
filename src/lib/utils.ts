// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, isToday, isTomorrow, isPast } from 'date-fns';

// ---- Class merging ----
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---- Date formatting ----
export function formatDate(date: string | Date, pattern = 'MMM d, yyyy'): string {
  return format(new Date(date), pattern);
}

export function formatRelative(date: string | Date): string {
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'MMM d');
}

export function formatTimeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function daysUntil(date: string | Date): number {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

export function isOverdue(date: string | Date): boolean {
  return isPast(new Date(date));
}

// ---- Status helpers ----
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    TODO: 'status-todo',
    IN_PROGRESS: 'status-in-progress',
    REVIEW: 'status-review',
    COMPLETED: 'status-completed',
  };
  return map[status] ?? 'status-todo';
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    LOW: 'priority-low',
    MEDIUM: 'priority-medium',
    HIGH: 'priority-high',
    CRITICAL: 'priority-critical',
  };
  return map[priority] ?? 'priority-medium';
}

export function getHealthColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-blue-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
}

export function getHealthBg(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

// ---- Avatar ----
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

// ---- Number formatting ----
export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function formatPercent(n: number): string {
  return `${Math.round(n)}%`;
}

// ---- Status labels ----
export const STATUS_LABELS: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  COMPLETED: 'Completed',
  PLANNING: 'Planning',
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  ARCHIVED: 'Archived',
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};
