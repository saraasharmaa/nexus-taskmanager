'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, FolderKanban, Calendar, Users, AlertTriangle } from 'lucide-react';
import { useProjects, useCreateProject, useDeleteProject } from '@/hooks/use-queries';
import { useAuthStore } from '@/store/auth.store';
import { formatDate, daysUntil, getHealthBg, getHealthColor } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  PLANNING: 'bg-slate-500/10 text-slate-400',
  ACTIVE: 'bg-blue-500/10 text-blue-400',
  ON_HOLD: 'bg-amber-500/10 text-amber-400',
  COMPLETED: 'bg-green-500/10 text-green-400',
  ARCHIVED: 'bg-gray-500/10 text-gray-400',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-green-500/10 text-green-400',
  MEDIUM: 'bg-amber-500/10 text-amber-400',
  HIGH: 'bg-red-500/10 text-red-400',
  CRITICAL: 'bg-red-700/20 text-red-300',
};

export default function ProjectsPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', deadline: '' });
  const [formError, setFormError] = useState('');

  const { data, isLoading, refetch } = useProjects({ search, status: statusFilter || undefined });
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();

  const projects = data?.data?.data ?? [];
  const canCreate = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) { setFormError('Project name is required'); return; }
    try {
      await createProject.mutateAsync({ ...form, status: 'PLANNING' });
      setShowCreate(false);
      setForm({ name: '', description: '', priority: 'MEDIUM', deadline: '' });
      refetch();
    } catch (err: unknown) {
      setFormError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to create project');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{projects.length} projects</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="bg-muted/50 border border-border rounded-lg pl-8 pr-3 py-1.5 text-sm outline-none focus:border-primary/60 w-52 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary/60 cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
          </select>
          {canCreate && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> New Project
            </button>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-semibold mb-4">Create New Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              {formError && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{formError}</p>}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Project Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Mobile App Redesign" className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/60 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this project about?" rows={3} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/60 transition-all resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }))} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/60 cursor-pointer">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Deadline</label>
                  <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/60 transition-all" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2 border border-border rounded-lg text-sm hover:bg-muted/50 transition-colors">Cancel</button>
                <button type="submit" disabled={createProject.isPending} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {createProject.isPending ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="nexus-card animate-pulse h-52">
              <div className="h-4 bg-muted rounded w-3/4 mb-3" />
              <div className="h-3 bg-muted rounded w-full mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <FolderKanban className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-base font-medium">No projects found</p>
          <p className="text-sm mt-1">{canCreate ? 'Create your first project to get started.' : 'You have no projects assigned yet.'}</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        >
          {projects.map((project: {
            id: string; name: string; description?: string; status: string; priority: string;
            healthScore: number; progress?: number; deadline?: string; riskLevel?: string;
            completedTasks?: number; _count?: { tasks: number }; overdueTasks?: number;
            manager?: { name: string }; team?: { name: string };
          }) => {
            const days = project.deadline ? daysUntil(project.deadline) : null;
            const health = project.healthScore ?? 80;
            return (
              <motion.div
                key={project.id}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                className="nexus-card hover:border-border/80 cursor-pointer group transition-all"
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{project.name}</h3>
                    {project.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{project.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1.5 ml-2 flex-shrink-0">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[project.status]}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Health bar */}
                <div className="flex items-center gap-2 mb-3 bg-muted/40 rounded-lg p-2.5">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${getHealthBg(health)}`} style={{ width: `${health}%` }} />
                  </div>
                  <span className={`text-xs font-bold ${getHealthColor(health)}`}>{health}%</span>
                  <span className="text-[10px] text-muted-foreground">health</span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-muted/40 rounded-lg p-2 text-center">
                    <div className="text-sm font-bold">{project._count?.tasks ?? 0}</div>
                    <div className="text-[10px] text-muted-foreground">Tasks</div>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-2 text-center">
                    <div className="text-sm font-bold text-green-400">{project.completedTasks ?? 0}</div>
                    <div className="text-[10px] text-muted-foreground">Done</div>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-2 text-center">
                    <div className={`text-sm font-bold ${(project.overdueTasks ?? 0) > 0 ? 'text-red-400' : ''}`}>
                      {project.overdueTasks ?? 0}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Overdue</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {project.deadline && (
                      <span className={`flex items-center gap-1 ${days !== null && days < 7 ? 'text-amber-400' : days !== null && days < 0 ? 'text-red-400' : ''}`}>
                        <Calendar className="w-3 h-3" />
                        {days !== null && days < 0 ? `${Math.abs(days)}d overdue` : formatDate(project.deadline, 'MMM d')}
                      </span>
                    )}
                    {project.manager && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {project.manager.name.split(' ')[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${PRIORITY_COLORS[project.priority]}`}>
                      {project.priority}
                    </span>
                    {project.riskLevel === 'HIGH' && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                  </div>
                </div>

                {/* Delete button for admin */}
                {user?.role === 'ADMIN' && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${project.name}"? This cannot be undone.`)) {
                        await deleteProject.mutateAsync(project.id);
                        refetch();
                      }
                    }}
                    className="mt-3 w-full text-xs text-red-400/60 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Delete project
                  </button>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
