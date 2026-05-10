'use client';

import { useActivity } from '@/hooks/use-queries';
import { formatDistanceToNow } from 'date-fns';

const TYPE_COLORS: Record<string, string> = {
  TASK_COMPLETED: 'bg-green-500', TASK_CREATED: 'bg-blue-500',
  TASK_ASSIGNED: 'bg-primary', TASK_UPDATED: 'bg-amber-500',
  PROJECT_CREATED: 'bg-purple-500', MEMBER_JOINED: 'bg-teal-500',
  STATUS_CHANGED: 'bg-cyan-500', TASK_COMMENTED: 'bg-pink-500',
};

interface Activity {
  id: string; type: string; action: string; createdAt: string;
  user?: { name: string; avatarColor: string };
  project?: { name: string }; task?: { title: string };
}

export default function ActivityPage() {
  const { data, isLoading } = useActivity({ limit: 50 });
  const activities: Activity[] = data?.data ?? [];

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Activity Feed</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Live team collaboration stream</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-green-400">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
          Live
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="nexus-card animate-pulse flex gap-3 items-center h-16">
              <div className="w-2 h-2 rounded-full bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-3/4" />
                <div className="h-2 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No activity yet</div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
          <div className="space-y-1 pl-6">
            {activities.map((a, i) => (
              <div key={a.id} className={`flex gap-3 py-3 border-b border-border/30 last:border-0 relative ${i === 0 ? 'animate-fade-in' : ''}`}>
                <div className={`absolute -left-6 top-4 w-2.5 h-2.5 rounded-full border-2 border-background ${TYPE_COLORS[a.type] ?? 'bg-muted-foreground'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    {a.user && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0 mt-0.5" style={{ background: a.user.avatarColor }}>
                        {a.user.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">
                        {a.user && <strong className="font-medium">{a.user.name} </strong>}
                        <span className="text-muted-foreground">{a.action}</span>
                        {a.project && <span className="text-muted-foreground"> · <span className="text-foreground/70">{a.project.name}</span></span>}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        {a.createdAt ? formatDistanceToNow(new Date(a.createdAt), { addSuffix: true }) : 'Just now'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
