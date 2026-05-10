// src/hooks/use-queries.ts
// TanStack Query hooks — centralized data fetching layer

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useUIStore } from '@/store/ui.store';
import type {
  Task, Project, User, Notification, DashboardStats,
  CreateTaskInput, UpdateTaskInput, CreateProjectInput,
} from '@/types';

// ---- Query Keys ----
export const QK = {
  dashboard: ['analytics', 'dashboard'] as const,
  projects: (params?: Record<string, unknown>) => ['projects', params] as const,
  project: (id: string) => ['projects', id] as const,
  tasks: (params?: Record<string, unknown>) => ['tasks', params] as const,
  task: (id: string) => ['tasks', id] as const,
  users: (params?: Record<string, unknown>) => ['users', params] as const,
  user: (id: string) => ['users', id] as const,
  notifications: ['notifications'] as const,
  activity: (params?: Record<string, unknown>) => ['activity', params] as const,
  teams: ['teams'] as const,
  workload: ['analytics', 'workload'] as const,
};

// ---- Dashboard ----
export function useDashboard() {
  return useQuery({
    queryKey: QK.dashboard,
    queryFn: () => api.getDashboard().then((r) => r.data.data),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}

// ---- Projects ----
export function useProjects(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: QK.projects(params),
    queryFn: () => api.getProjects(params).then((r) => r.data.data),
    staleTime: 30 * 1000,
  });
}

export function useProject(id: string, enabled = true) {
  return useQuery({
    queryKey: QK.project(id),
    queryFn: () => api.getProject(id).then((r) => r.data.data),
    enabled: !!id && enabled,
    staleTime: 30 * 1000,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: (data: Partial<CreateProjectInput>) =>
      api.createProject(data as Record<string, unknown>).then((r) => r.data.data as Project),
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: QK.dashboard });
      showToast(`Project "${project.name}" created successfully`);
    },
    onError: (err: { response?: { data?: { error?: string } } }) => {
      showToast(err.response?.data?.error || 'Failed to create project', 'error');
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.updateProject(id, data).then((r) => r.data.data as Project),
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: QK.project(project.id) });
      qc.invalidateQueries({ queryKey: ['projects'] });
      showToast('Project updated');
    },
    onError: (err: { response?: { data?: { error?: string } } }) => {
      showToast(err.response?.data?.error || 'Failed to update project', 'error');
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: QK.dashboard });
      showToast('Project deleted');
    },
    onError: () => showToast('Failed to delete project', 'error'),
  });
}

// ---- Tasks ----
export function useTasks(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: QK.tasks(params),
    queryFn: () => api.getTasks(params).then((r) => r.data.data),
    staleTime: 15 * 1000,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: QK.task(id),
    queryFn: () => api.getTask(id).then((r) => r.data.data as Task),
    enabled: !!id,
    staleTime: 15 * 1000,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: (data: Partial<CreateTaskInput>) =>
      api.createTask(data as Record<string, unknown>).then((r) => r.data.data as Task),
    onSuccess: (task) => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: QK.project(task.projectId) });
      qc.invalidateQueries({ queryKey: QK.dashboard });
      showToast(`Task "${task.title}" created`);
    },
    onError: (err: { response?: { data?: { error?: string } } }) => {
      showToast(err.response?.data?.error || 'Failed to create task', 'error');
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdateTaskInput> }) =>
      api.updateTask(id, data as Record<string, unknown>).then((r) => r.data.data as Task),
    onSuccess: (task) => {
      qc.setQueryData(QK.task(task.id), task);
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: QK.dashboard });
      showToast('Task updated');
    },
    onError: () => showToast('Failed to update task', 'error'),
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, sortOrder }: { id: string; status: string; sortOrder?: number }) =>
      api.updateTaskStatus(id, status, sortOrder).then((r) => r.data.data as Task),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: QK.dashboard });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: QK.dashboard });
      showToast('Task deleted');
    },
    onError: () => showToast('Failed to delete task', 'error'),
  });
}

// ---- Users ----
export function useUsers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: QK.users(params),
    queryFn: () => api.getUsers(params).then((r) => r.data.data as { data: User[] }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.getMe().then((r) => r.data.data as User),
    staleTime: 5 * 60 * 1000,
  });
}

// ---- Notifications ----
export function useNotifications(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: QK.notifications,
    queryFn: () => api.getNotifications(params).then((r) => r.data.data),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // poll every minute
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.notifications }),
  });
}

// ---- Activity ----
export function useActivity(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: QK.activity(params),
    queryFn: () => api.getActivity(params).then((r) => r.data.data),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

// ---- Teams ----
export function useTeams() {
  return useQuery({
    queryKey: QK.teams,
    queryFn: () => api.getTeams().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });
}

// ---- Workload ----
export function useWorkload() {
  return useQuery({
    queryKey: QK.workload,
    queryFn: () => api.getWorkload().then((r) => r.data.data),
    staleTime: 60 * 1000,
  });
}
