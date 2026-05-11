'use client';
import { useUIStore } from '@/store/ui.store';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, CheckSquare, Calendar, MessageSquare, Tag } from 'lucide-react';
import { useTasks, useProjects, useUsers, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/use-queries';
import { useAuthStore } from '@/store/auth.store';
import { formatDate, daysUntil } from '@/lib/utils';

const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];
const STATUS_LABELS: Record<string, string> = { TODO: 'To Do', IN_PROGRESS: 'In Progress', REVIEW: 'Review', COMPLETED: 'Completed' };
const STATUS_STYLES: Record<string, string> = {
  TODO: 'bg-slate-500/10 text-slate-400',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-400',
  REVIEW: 'bg-purple-500/10 text-purple-400',
  COMPLETED: 'bg-green-500/10 text-green-400',
};
const PRIORITY_STYLES: Record<string, string> = {
  LOW: 'bg-green-500/10 text-green-400',
  MEDIUM: 'bg-amber-500/10 text-amber-400',
  HIGH: 'bg-red-500/10 text-red-400',
  CRITICAL: 'bg-red-700/20 text-red-300 font-semibold',
};

interface Task {
  id: string; title: string; description?: string; status: string; priority: string;
  dueDate?: string; assigneeId?: string; projectId: string;
  project?: { name: string }; assignee?: { name: string; avatarColor: string };
  tags?: { tag: { name: string } }[]; _count?: { comments: number };
}

export default function TasksPage() {
  const { user } = useAuthStore();
  const { activeModal, closeModal } = useUIStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [form, setForm] = useState({ title: '', description: '', projectId: '', assigneeId: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', tags: '' });
  const [formError, setFormError] = useState('');

  const canManage = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  const { data, isLoading, refetch } = useTasks({
    search: search || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  });
  const { data: projectsData } = useProjects({});
  const { data: usersData } = useUsers({});
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const tasks: Task[] = data?.data?.data ?? [];
  const projects = projectsData?.data?.data ?? [];
  const members = usersData?.data?.data ?? [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.title.trim()) { setFormError('Title is required'); return; }
    if (!form.projectId) { setFormError('Select a project'); return; }
    try {
      await createTask.mutateAsync({
        title: form.title,
        description: form.description || undefined,
        projectId: form.projectId,
        assigneeId: form.assigneeId || undefined,
        priority: form.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        status: form.status as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED',
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });
      closeModal();
      setForm({ title: '', description: '', projectId: '', assigneeId: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', tags: '' });
      refetch();
    } catch (err: unknown) {
      setFormError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    await updateTask.mutateAsync({ id: taskId, data: { status: newStatus as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' } });
    refetch();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{tasks.length} tasks</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." className="bg-muted/50 border border-border rounded-lg pl-8 pr-3 py-1.5 text-sm outline-none focus:border-primary/60 w-48 transition-all" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-sm outline-none cursor-pointer">
            <option value="">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-sm outline-none cursor-pointer">
            <option value="">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          {canManage && (
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> New Task
            </button>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {activeModal === 'createTask' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => closeModal()}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-semibold mb-4">Create Task</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              {formError && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{formError}</p>}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Task title..." className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/60 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Optional details..." className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/60 transition-all resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Project *</label>
                  <select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/60 cursor-pointer">
                    <option value="">Select project</option>
                    {(projects as { id: string; name: string }[]).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Assign to</label>
                  <select value={form.assigneeId} onChange={e => setForm(f => ({ ...f, assigneeId: e.target.value }))} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/60 cursor-pointer">
                    <option value="">Unassigned</option>
                    {(members as { id: string; name: string }[]).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/60 cursor-pointer">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/60 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tags (comma-separated)</label>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="frontend, bug, urgent" className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/60 transition-all" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => closeModal()} className="flex-1 py-2 border border-border rounded-lg text-sm hover:bg-muted/50 transition-colors">Cancel</button>
                <button type="submit" disabled={createTask.isPending} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {createTask.isPending ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Table */}
      {isLoading ? (
        <div className="nexus-card animate-pulse">
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted rounded mb-2" />)}
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <CheckSquare className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-base font-medium">No tasks found</p>
        </div>
      ) : (
        <div className="nexus-card p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Task</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Priority</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Assignee</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Due</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Tags</th>
                {canManage && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const days = task.dueDate ? daysUntil(task.dueDate) : null;
                return (
                  <motion.tr
                    key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm">{task.title}</div>
                      <div className="text-xs text-muted-foreground">{task.project?.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={task.status}
                        onChange={e => handleStatusChange(task.id, e.target.value)}
                        disabled={user?.role === 'MEMBER' && task.assigneeId !== user?.id}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${STATUS_STYLES[task.status]}`}
                        style={{ background: 'transparent' }}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[task.priority]}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-semibold" style={{ background: task.assignee.avatarColor }}>
                            {task.assignee.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs">{task.assignee.name.split(' ')[0]}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {task.dueDate ? (
                        <div className={`flex items-center gap-1 text-xs ${days !== null && days < 0 ? 'text-red-400' : days !== null && days < 3 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                          <Calendar className="w-3 h-3" />
                          {days !== null && days < 0 ? `${Math.abs(days)}d overdue` : formatDate(task.dueDate, 'MMM d')}
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {(task.tags ?? []).slice(0, 2).map((t, i) => (
                          <span key={i} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{t.tag.name}</span>
                        ))}
                      </div>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <button
                          onClick={async () => {
                            if (confirm('Delete this task?')) { await deleteTask.mutateAsync(task.id); refetch(); }
                          }}
                          className="text-xs text-red-400/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
