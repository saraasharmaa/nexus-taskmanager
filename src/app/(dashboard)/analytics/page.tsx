'use client';

import { useDashboard } from '@/hooks/use-queries';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  TODO: '#4B5563', IN_PROGRESS: '#4f7bef', REVIEW: '#a855f7', COMPLETED: '#22c55e',
};

export default function AnalyticsPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="p-6 grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="nexus-card h-64 animate-pulse" />)}
      </div>
    );
  }

  const { overview, charts, workload } = data ?? {};

  const tooltipStyle = {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 8,
    fontSize: 12,
    color: 'hsl(var(--foreground))',
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Analytics</h1>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Projects', value: overview?.totalProjects ?? 0, icon: TrendingUp, color: 'text-blue-400' },
          { label: 'Completed Tasks', value: overview?.completedTasks ?? 0, icon: CheckCircle, color: 'text-green-400' },
          { label: 'In Progress', value: overview?.inProgressTasks ?? 0, icon: Clock, color: 'text-amber-400' },
          { label: 'Overdue', value: overview?.overdueTasks ?? 0, icon: AlertTriangle, color: 'text-red-400' },
        ].map((s, i) => (
          <div key={i} className="nexus-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className={`text-3xl font-bold tracking-tight ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Monthly velocity */}
        <div className="nexus-card">
          <h2 className="text-sm font-semibold mb-1">Task Velocity</h2>
          <p className="text-xs text-muted-foreground mb-4">Tasks created vs completed per month</p>
          <div className="flex gap-4 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-500/70 inline-block" />Completed</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500/70 inline-block" />Created</span>
          </div>
          {(charts?.monthlyBreakdown?.length ?? 0) === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
              Create and complete tasks to generate analytics.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts?.monthlyBreakdown ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="completed" fill="rgba(34,197,94,.65)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="created" fill="rgba(79,123,239,.65)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>

        {/* Task status donut */}
        <div className="nexus-card">
          <h2 className="text-sm font-semibold mb-1">Task Distribution</h2>
          <p className="text-xs text-muted-foreground mb-4">Current status breakdown</p>
          <div className="flex items-center gap-6">
            {(charts?.statusDistribution?.length ?? 0) === 0 ? (
              <div className="h-[160px] flex items-center justify-center text-sm text-muted-foreground">
                No task distribution data yet.
              </div>
            ) : (
              <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={charts?.statusDistribution ?? []} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="count">
                  {(charts?.statusDistribution ?? []).map((entry: { status: string }, i: number) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.status] ?? '#888'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            )}
            <div className="flex-1 space-y-2">
              {(charts?.statusDistribution ?? []).map((s: { status: string; count: number }, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: STATUS_COLORS[s.status] }} />
                  <span className="flex-1 text-xs text-muted-foreground">{s.status.replace('_', ' ')}</span>
                  <span className="text-sm font-semibold">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly trend */}
      <div className="nexus-card mb-4">
        <h2 className="text-sm font-semibold mb-1">Weekly Completion Trend</h2>
        <p className="text-xs text-muted-foreground mb-4">Tasks completed each week</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={charts?.weeklyTrend ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Completed" />
            <Line type="monotone" dataKey="created" stroke="#4f7bef" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" name="Created" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Team workload */}
      <div className="nexus-card">
        <h2 className="text-sm font-semibold mb-4">Team Workload</h2>
        <div className="space-y-3">
          {(workload ?? []).map((m: { userId: string; name: string; avatarColor: string; activeTasks: number; capacityPercent: number; isOverloaded: boolean }) => (
            <div key={m.userId} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0" style={{ background: m.avatarColor }}>
                {m.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="w-28 text-sm truncate">{m.name.split(' ')[0]}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${m.capacityPercent > 80 ? 'bg-red-500' : m.capacityPercent > 60 ? 'bg-amber-500' : 'bg-green-500'}`}
                  style={{ width: `${m.capacityPercent}%` }}
                />
              </div>
              <span className={`text-xs font-semibold w-10 text-right ${m.capacityPercent > 80 ? 'text-red-400' : m.capacityPercent > 60 ? 'text-amber-400' : 'text-green-400'}`}>
                {m.capacityPercent}%
              </span>
              <span className="text-xs text-muted-foreground w-16">{m.activeTasks} tasks</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
