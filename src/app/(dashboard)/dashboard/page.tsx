// src/app/(dashboard)/dashboard/page.tsx
'use client';

import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { useDashboard, useActivity, useNotifications } from '@/hooks/use-queries';
import { useAuthStore } from '@/store/auth.store';
import {
  MetricCard,
  AiInsightCard,
  WorkloadBar,
  ActivityFeed,
  ProjectHealthRow
} from '@/components/dashboard';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import {
  FolderOpen, CheckCircle, Clock, AlertTriangle,
  TrendingUp, Users, Zap,
} from 'lucide-react';

const STAGGER = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } },
  item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } } },
};

const STATUS_COLORS: Record<string, string> = {
  TODO: '#4B5563',
  IN_PROGRESS: '#4f7bef',
  REVIEW: '#a855f7',
  COMPLETED: '#22c55e',
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useDashboard();
  const { data: activityData } = useActivity({ limit: 8 });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <div className="content-area">
        <div className="mb-6 h-8 w-64 skeleton rounded" />
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SkeletonCard className="h-64" />
          <SkeletonCard className="h-64" />
        </div>
      </div>
    );
  }

  const { overview, charts, workload, riskProjects } = data || {};

  return (
    <div className="content-area">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here's what's happening across your workspace today.
        </p>
      </motion.div>

      {/* Metric Cards */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        variants={STAGGER.container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={STAGGER.item}>
          <MetricCard
            label="Active Projects"
            value={overview?.activeProjects ?? 0}
            total={overview?.totalProjects}
            change="+2 this month"
            changeType="positive"
            icon={FolderOpen}
            color="blue"
          />
        </motion.div>
        <motion.div variants={STAGGER.item}>
          <MetricCard
            label="Completed Tasks"
            value={overview?.completedTasks ?? 0}
            change={`↑ ${Math.abs(overview?.completionRateChange ?? 0)}% vs last week`}
            changeType="positive"
            icon={CheckCircle}
            color="green"
          />
        </motion.div>
        <motion.div variants={STAGGER.item}>
          <MetricCard
            label="In Progress"
            value={overview?.inProgressTasks ?? 0}
            change={`Across ${overview?.activeProjects ?? 0} projects`}
            changeType="neutral"
            icon={Clock}
            color="amber"
          />
        </motion.div>
        <motion.div variants={STAGGER.item}>
          <MetricCard
            label="Overdue Tasks"
            value={overview?.overdueTasks ?? 0}
            change="Needs attention"
            changeType={overview?.overdueTasks ? 'negative' : 'neutral'}
            icon={AlertTriangle}
            color="red"
          />
        </motion.div>
      </motion.div>

      {/* AI Insight */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <AiInsightCard
          title="Workspace Insights"
          insights={[
            {
              label: 'Projects',
              value: `${overview?.totalProjects ?? 0} Active`,
              sub: `${overview?.activeProjects ?? 0} currently running`,
              color: 'text-blue-400',
            },
            {
              label: 'Tasks Completed',
              value: `${overview?.completedTasks ?? 0}`,
              sub: `${overview?.inProgressTasks ?? 0} still in progress`,
              color: 'text-green-400',
            },
            {
              label: 'Overdue Tasks',
              value: `${overview?.overdueTasks ?? 0}`,
              sub:
                (overview?.overdueTasks ?? 0) > 0
                  ? 'Needs attention'
                  : 'No overdue work',
              color:
                (overview?.overdueTasks ?? 0) > 0
                  ? 'text-red-400'
                  : 'text-emerald-400',
            },
          ]}
        />
      </motion.div>

      {/* Charts Row */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {/* Trend Chart */}
        <div className="nexus-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Task Completion Trend</h3>
              <p className="text-xs text-muted-foreground">Last 8 weeks</p>
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-green-500/70 inline-block" />
                Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500/70 inline-block" />
                Created
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={charts?.weeklyTrend ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="created" stroke="#4f7bef" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Donut */}
        <div className="nexus-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Task Distribution</h3>
              <p className="text-xs text-muted-foreground">By current status</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={charts?.statusDistribution ?? []}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {(charts?.statusDistribution ?? []).map(
                    (entry: { status: string }, i: number) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.status] ?? '#888'} />
                    )
                  )}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2.5">
              {(charts?.statusDistribution ?? []).map(
                (s: { status: string; count: number }, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ background: STATUS_COLORS[s.status] }}
                    />
                    <span className="flex-1 text-xs text-muted-foreground">
                      {s.status.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-semibold">{s.count}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Projects + Activity */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {/* Risk projects */}
        <div className="nexus-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Active Projects</h3>
            <a href="/projects" className="text-xs text-primary hover:underline">
              View all →
            </a>
          </div>
          <div className="space-y-4">
            {(riskProjects ?? []).slice(0, 4).map((p: {
              id: string; name: string; overdue: number; daysLeft: number;
              progress: number; healthScore: number;
            }) => (
              <ProjectHealthRow key={p.id} project={p} />
            ))}
            {!riskProjects?.length && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No at-risk projects 🎉
              </p>
            )}
          </div>
        </div>

        {/* Activity feed */}
        <div className="nexus-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Live Activity</h3>
            <div className="flex items-center gap-1.5 text-xs text-green-400">
              <span className="live-dot" />
              Live
            </div>
          </div>
          <ActivityFeed activities={activityData?.data ?? []} limit={7} />
        </div>
      </motion.div>

      {/* Workload */}
      <motion.div
        className="nexus-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Team Workload Snapshot</h3>
            <p className="text-xs text-muted-foreground">Current sprint capacity utilization</p>
          </div>
          <a href="/workload" className="text-xs text-primary hover:underline">
            Full report →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          {(workload ?? []).map((member: {
            userId: string; name: string; avatarColor: string;
            activeTasks: number; capacityPercent: number; isOverloaded: boolean;
          }, i: number) => (
            <WorkloadBar key={member.userId} member={member} delay={i * 0.05} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
