// src/components/dashboard/metric-card.tsx
'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MetricCardProps {
  label: string;
  value: number;
  total?: number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple';
}

const COLOR_MAP = {
  blue: {
    bar: 'from-blue-500 to-blue-400',
    icon: 'text-blue-400 bg-blue-500/10',
    value: 'text-blue-400',
  },
  green: {
    bar: 'from-green-500 to-green-400',
    icon: 'text-green-400 bg-green-500/10',
    value: 'text-green-400',
  },
  amber: {
    bar: 'from-amber-500 to-amber-400',
    icon: 'text-amber-400 bg-amber-500/10',
    value: 'text-amber-400',
  },
  red: {
    bar: 'from-red-500 to-red-400',
    icon: 'text-red-400 bg-red-500/10',
    value: 'text-red-400',
  },
  purple: {
    bar: 'from-purple-500 to-purple-400',
    icon: 'text-purple-400 bg-purple-500/10',
    value: 'text-purple-400',
  },
};

export function MetricCard({ label, value, total, change, changeType, icon: Icon, color }: MetricCardProps) {
  const colors = COLOR_MAP[color];

  return (
    <div className="metric-card hover:border-border/80 cursor-default">
      <div className={cn('absolute top-0 left-0 right-0 h-0.5 rounded-t-xl bg-gradient-to-r', colors.bar)} />
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <div className={cn('p-1.5 rounded-lg', colors.icon)}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <motion.div
        className={cn('text-3xl font-bold tracking-tight mb-1', colors.value)}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {value.toLocaleString()}
        {total !== undefined && (
          <span className="text-sm font-normal text-muted-foreground ml-1">/ {total}</span>
        )}
      </motion.div>
      <p className={cn(
        'text-xs',
        changeType === 'positive' ? 'text-green-400' :
        changeType === 'negative' ? 'text-red-400' : 'text-muted-foreground'
      )}>
        {change}
      </p>
    </div>
  );
}

// ============================================================
// src/components/dashboard/ai-insight-card.tsx
// ============================================================

interface InsightItem {
  label: string;
  value: string;
  sub: string;
  color: string;
}

interface AiInsightCardProps {
  title: string;
  insights: InsightItem[];
  detail: string;
}

export function AiInsightCard({ title, insights, detail }: AiInsightCardProps) {
  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 bg-primary/15 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
          <span>✦</span>
          <span>AI Insight</span>
        </div>
      </div>
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <div className="grid grid-cols-3 gap-3 mb-3">
        {insights.map((item, i) => (
          <div key={i} className="bg-black/10 dark:bg-black/20 rounded-lg p-3">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{item.label}</div>
            <div className={cn('text-sm font-semibold', item.color)}>{item.value}</div>
            <div className="text-xs text-muted-foreground">{item.sub}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
    </div>
  );
}

// ============================================================
// src/components/dashboard/workload-bar.tsx
// ============================================================

interface WorkloadBarProps {
  member: {
    userId: string;
    name: string;
    avatarColor: string;
    activeTasks: number;
    capacityPercent: number;
    isOverloaded: boolean;
  };
  delay?: number;
}

export function WorkloadBar({ member, delay = 0 }: WorkloadBarProps) {
  const barColor = member.capacityPercent > 80
    ? 'bg-red-500'
    : member.capacityPercent > 60
    ? 'bg-amber-500'
    : 'bg-green-500';

  const textColor = member.capacityPercent > 80
    ? 'text-red-400'
    : member.capacityPercent > 60
    ? 'text-amber-400'
    : 'text-green-400';

  return (
    <motion.div
      className="flex items-center gap-3 mb-3"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div className="flex items-center gap-2 w-36">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0"
          style={{ background: member.avatarColor }}
        >
          {member.name.slice(0, 2).toUpperCase()}
        </div>
        <span className="text-xs truncate">{member.name.split(' ')[0]}</span>
      </div>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${member.capacityPercent}%` }}
          transition={{ delay: delay + 0.1, duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <span className={cn('text-xs font-semibold w-9 text-right', textColor)}>
        {member.capacityPercent}%
      </span>
    </motion.div>
  );
}

// ============================================================
// src/components/dashboard/activity-feed.tsx
// ============================================================

import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  user?: { name: string; avatarColor: string };
  action: string;
  createdAt: string;
  type: string;
}

const TYPE_COLORS: Record<string, string> = {
  TASK_COMPLETED: 'bg-green-500',
  TASK_CREATED: 'bg-blue-500',
  TASK_ASSIGNED: 'bg-primary',
  TASK_UPDATED: 'bg-amber-500',
  PROJECT_CREATED: 'bg-purple-500',
  MEMBER_JOINED: 'bg-teal-500',
  STATUS_CHANGED: 'bg-cyan-500',
};

export function ActivityFeed({ activities, limit = 10 }: { activities: Activity[]; limit?: number }) {
  const items = activities.slice(0, limit);

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <p className="text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {items.map((activity, i) => (
        <div key={activity.id} className="flex gap-3 py-2.5 border-b border-border/50 last:border-0">
          <div className={cn(
            'w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2',
            TYPE_COLORS[activity.type] ?? 'bg-muted-foreground'
          )} />
          <div className="flex-1 min-w-0">
            <p className="text-xs leading-relaxed">
              <span className="font-medium text-foreground">
                {activity.user?.name ?? 'System'}
              </span>{' '}
              <span className="text-muted-foreground">{activity.action}</span>
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              {activity.createdAt
                ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })
                : 'Just now'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// src/components/dashboard/project-health-row.tsx
// ============================================================

interface ProjectHealthRowProps {
  project: {
    id: string;
    name: string;
    overdue: number;
    daysLeft: number;
    progress: number;
    healthScore: number;
  };
}

export function ProjectHealthRow({ project }: ProjectHealthRowProps) {
  const healthColor =
    project.healthScore >= 80
      ? 'bg-green-500'
      : project.healthScore >= 50
      ? 'bg-blue-500'
      : project.healthScore >= 25
      ? 'bg-amber-500'
      : 'bg-red-500';

  const healthText =
    project.healthScore >= 80
      ? 'text-green-400'
      : project.healthScore >= 50
      ? 'text-blue-400'
      : project.healthScore >= 25
      ? 'text-amber-400'
      : 'text-red-400';

  const riskLabel =
    project.overdue > 3 || project.daysLeft < 7
      ? { label: 'High Risk', color: 'bg-red-500/10 text-red-400' }
      : project.overdue > 0 || project.daysLeft < 14
      ? { label: 'Medium Risk', color: 'bg-amber-500/10 text-amber-400' }
      : { label: 'On Track', color: 'bg-green-500/10 text-green-400' };

  return (
    <div className="space-y-2 pb-3 border-b border-border/50 last:border-0 last:pb-0">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium truncate flex-1 mr-2">{project.name}</span>
        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', riskLabel.color)}>
          {riskLabel.label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', healthColor)}
            style={{ width: `${project.healthScore}%` }}
          />
        </div>
        <span className={cn('text-xs font-semibold w-8 text-right', healthText)}>
          {project.healthScore}%
        </span>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <span>{project.progress}% complete</span>
        {project.overdue > 0 && (
          <span className="text-red-400">{project.overdue} overdue</span>
        )}
        <span className={project.daysLeft < 7 ? 'text-amber-400' : ''}>
          {project.daysLeft < 0
            ? `${Math.abs(project.daysLeft)}d overdue`
            : `${project.daysLeft}d left`}
        </span>
      </div>
    </div>
  );
}

// ============================================================
// src/components/ui/skeleton-card.tsx
// ============================================================

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('nexus-card animate-pulse', className)}>
      <div className="h-3 bg-muted rounded w-24 mb-4" />
      <div className="h-8 bg-muted rounded w-16 mb-3" />
      <div className="h-2 bg-muted rounded w-32" />
    </div>
  );
}

