'use client';
// src/app/(dashboard)/workload/page.tsx

import { useDashboard } from '@/hooks/use-queries';
import { AlertTriangle } from 'lucide-react';

export default function WorkloadPage() {
  const { data, isLoading } = useDashboard();
  const workload = data?.workload ?? [];

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-2">Workload</h1>
      <p className="text-sm text-muted-foreground mb-6">Team capacity planning and load balancing</p>

      {/* Overload alerts */}
      {workload.filter((m: { isOverloaded: boolean }) => m.isOverloaded).length > 0 && (
        <div className="space-y-2 mb-6">
          {workload.filter((m: { isOverloaded: boolean }) => m.isOverloaded).map((m: { userId: string; name: string; capacityPercent: number; activeTasks: number }) => (
            <div key={m.userId} className="flex items-center gap-3 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm">
                <strong className="text-red-400">{m.name}</strong>
                <span className="text-muted-foreground"> is at {m.capacityPercent}% capacity ({m.activeTasks} active tasks). Consider redistributing tasks.</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="nexus-card animate-pulse h-64" />
      ) : workload.length === 0 ? (
          <div className="nexus-card h-48 flex items-center justify-center text-sm text-muted-foreground">
            Assign tasks to team members to generate workload analytics.
          </div>
        ) : (
        <div className="nexus-card">
          <h2 className="text-sm font-semibold mb-4">Capacity Utilization</h2>
          <div className="space-y-4">
            {workload.map((m: { userId: string; name: string; avatarColor: string; activeTasks: number; capacityPercent: number; isOverloaded: boolean; completedThisWeek: number }) => (
              <div key={m.userId} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0" style={{ background: m.avatarColor }}>
                  {m.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="w-32 flex-shrink-0">
                  <div className="text-sm font-medium">{m.name.split(' ')[0]}</div>
                  <div className="text-xs text-muted-foreground">{m.activeTasks} active · {m.completedThisWeek ?? 0} done/week</div>
                </div>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${m.capacityPercent > 80 ? 'bg-red-500' : m.capacityPercent > 60 ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${m.capacityPercent}%` }}
                  />
                </div>
                <div className={`w-12 text-right text-sm font-bold ${m.capacityPercent > 80 ? 'text-red-400' : m.capacityPercent > 60 ? 'text-amber-400' : 'text-green-400'}`}>
                  {m.capacityPercent}%
                </div>
                <div className={`w-24 text-xs font-medium px-2 py-0.5 rounded-full text-center ${m.isOverloaded ? 'bg-red-500/10 text-red-400' : m.capacityPercent > 60 ? 'bg-amber-500/10 text-amber-400' : 'bg-green-500/10 text-green-400'}`}>
                  {m.isOverloaded ? 'Overloaded' : m.capacityPercent > 60 ? 'Active' : 'Available'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
