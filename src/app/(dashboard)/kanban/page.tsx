'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar } from 'lucide-react';
import { useTasks, useUpdateTask } from '@/hooks/use-queries';
import { useAuthStore } from '@/store/auth.store';
import { formatDate, daysUntil } from '@/lib/utils';

const COLUMNS = [
  { id: 'TODO', label: 'To Do', color: '#5a6480', bg: 'rgba(90,100,128,.12)' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: '#4f7bef', bg: 'rgba(79,123,239,.12)' },
  { id: 'REVIEW', label: 'Review', color: '#a855f7', bg: 'rgba(168,85,247,.12)' },
  { id: 'COMPLETED', label: 'Completed', color: '#22c55e', bg: 'rgba(34,197,94,.10)' },
];

const PRIORITY_DOT: Record<string, string> = {
  LOW: 'bg-green-400', MEDIUM: 'bg-amber-400', HIGH: 'bg-red-400', CRITICAL: 'bg-red-600',
};

interface Task {
  id: string; title: string; status: string; priority: string;
  dueDate?: string; projectId: string;
  project?: { name: string }; assignee?: { name: string; avatarColor: string };
  tags?: { tag: { name: string } }[]; _count?: { comments: number };
}

export default function KanbanPage() {
  const { user } = useAuthStore();
  const { data, refetch } = useTasks({});
  const updateTask = useUpdateTask();
  const [dragging, setDragging] = useState<string | null>(null);

  const tasks: Task[] = data?.data?.data ?? [];
  const canUpdate = true; // All roles can see; members can update own tasks

  const getColumnTasks = (status: string) => tasks.filter(t => t.status === status);

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === targetStatus) return;
    // RBAC: members can only move their own tasks
    if (user?.role === 'MEMBER' && task.assignee?.name !== user.name) return;
    await updateTask.mutateAsync({ id: taskId, data: { status: targetStatus as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' } });
    refetch();
    setDragging(null);
  };

  return (
    <div className="p-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Kanban Board</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Drag cards to update status</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 min-w-[900px]">
        {COLUMNS.map(col => {
          const colTasks = getColumnTasks(col.id);
          return (
            <div
              key={col.id}
              className="flex flex-col rounded-xl border border-border overflow-hidden"
              style={{ background: 'hsl(var(--card))' }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, col.id)}
            >
              {/* Column header */}
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
                <div className="w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold" style={{ background: col.bg, color: col.color }}>
                  {colTasks.length}
                </div>
                <span className="text-sm font-semibold">{col.label}</span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 p-2 flex-1 min-h-[300px]">
                {colTasks.map(task => {
                  const days = task.dueDate ? daysUntil(task.dueDate) : null;
                  return (
                    <motion.div
                      key={task.id}
                      draggable
                      onDragStart={(e: any) => { e.dataTransfer.setData('taskId', task.id); setDragging(task.id); }}
                      onDragEnd={() => setDragging(null)}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`bg-background border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-border/80 hover:-translate-y-0.5 transition-all ${dragging === task.id ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}`} />
                        <span className="text-[10px] text-muted-foreground">{task.priority}</span>
                        {days !== null && days < 0 && (
                          <span className="ml-auto text-[10px] text-red-400 font-medium">Overdue</span>
                        )}
                      </div>

                      <p className="text-sm font-medium leading-tight mb-1.5">{task.title}</p>
                      <p className="text-[11px] text-muted-foreground mb-2">{task.project?.name}</p>

                      {(task.tags ?? []).length > 0 && (
                        <div className="flex gap-1 flex-wrap mb-2">
                          {(task.tags ?? []).slice(0, 2).map((t, i) => (
                            <span key={i} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{t.tag.name}</span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        {task.assignee ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-semibold" style={{ background: task.assignee.avatarColor }}>
                              {task.assignee.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-[11px] text-muted-foreground">{task.assignee.name.split(' ')[0]}</span>
                          </div>
                        ) : <div />}

                        {task.dueDate && (
                          <div className={`flex items-center gap-1 text-[11px] ${days !== null && days < 0 ? 'text-red-400' : days !== null && days < 3 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                            <Calendar className="w-3 h-3" />
                            {formatDate(task.dueDate, 'MMM d')}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Empty state */}
                {colTasks.length === 0 && (
                  <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border/50 rounded-lg m-1 min-h-[80px]">
                    <p className="text-xs text-muted-foreground">Drop cards here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
