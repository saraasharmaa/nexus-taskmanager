// src/lib/api-client.ts
// Axios instance with JWT interceptors and automatic token refresh

import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Send cookies
  timeout: 15000,
});

// ---- Request Interceptor: Attach Bearer token ----
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('nexus-auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          const token = parsed?.state?.accessToken;
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      } catch {
        // Storage unavailable
      }
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// ---- Response Interceptor: Handle 401, refresh token ----
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${token}`,
          };
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await apiClient.post('/auth/refresh');
        const newToken = res.data?.data?.accessToken;

        if (newToken) {
          // Update zustand store
          try {
            const stored = localStorage.getItem('nexus-auth');
            if (stored) {
              const parsed = JSON.parse(stored);
              parsed.state.accessToken = newToken;
              localStorage.setItem('nexus-auth', JSON.stringify(parsed));
            }
          } catch {
            // ignore
          }

          processQueue(null, newToken);
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newToken}`,
          };
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        // Clear auth on refresh failure
        if (typeof window !== 'undefined') {
          localStorage.removeItem('nexus-auth');
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ---- Typed API helpers ----

export const api = {
  // Auth
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  signup: (data: Record<string, unknown>) =>
    apiClient.post('/auth/signup', data),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: () => apiClient.post('/auth/refresh'),

  // Users
  getUsers: (params?: Record<string, unknown>) =>
    apiClient.get('/users', { params }),
  getUser: (id: string) => apiClient.get(`/users/${id}`),
  updateUser: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/users/${id}`, data),
  deleteUser: (id: string) => apiClient.delete(`/users/${id}`),
  getMe: () => apiClient.get('/users/me'),

  // Projects
  getProjects: (params?: Record<string, unknown>) =>
    apiClient.get('/projects', { params }),
  getProject: (id: string) => apiClient.get(`/projects/${id}`),
  createProject: (data: Record<string, unknown>) =>
    apiClient.post('/projects', data),
  updateProject: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/projects/${id}`, data),
  deleteProject: (id: string) => apiClient.delete(`/projects/${id}`),

  // Tasks
  getTasks: (params?: Record<string, unknown>) =>
    apiClient.get('/tasks', { params }),
  getTask: (id: string) => apiClient.get(`/tasks/${id}`),
  createTask: (data: Record<string, unknown>) =>
    apiClient.post('/tasks', data),
  updateTask: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/tasks/${id}`, data),
  deleteTask: (id: string) => apiClient.delete(`/tasks/${id}`),
  updateTaskStatus: (id: string, status: string, sortOrder?: number) =>
    apiClient.patch(`/tasks/${id}/status`, { status, sortOrder }),

  // Comments
  getComments: (taskId: string) =>
    apiClient.get(`/tasks/${taskId}/comments`),
  createComment: (taskId: string, content: string) =>
    apiClient.post(`/tasks/${taskId}/comments`, { content, taskId }),
  updateComment: (taskId: string, commentId: string, content: string) =>
    apiClient.put(`/tasks/${taskId}/comments/${commentId}`, { content }),
  deleteComment: (taskId: string, commentId: string) =>
    apiClient.delete(`/tasks/${taskId}/comments/${commentId}`),

  // Teams
  getTeams: () => apiClient.get('/teams'),
  createTeam: (data: Record<string, unknown>) =>
    apiClient.post('/teams', data),
  addTeamMember: (teamId: string, userId: string) =>
    apiClient.post(`/teams/${teamId}/members`, { userId }),
  removeTeamMember: (teamId: string, userId: string) =>
    apiClient.delete(`/teams/${teamId}/members/${userId}`),

  // Notifications
  getNotifications: (params?: Record<string, unknown>) =>
    apiClient.get('/notifications', { params }),
  markAllRead: () => apiClient.patch('/notifications'),
  markRead: (id: string) => apiClient.patch(`/notifications/${id}`),

  // Analytics
  getDashboard: () => apiClient.get('/analytics/dashboard'),
  getProductivity: () => apiClient.get('/analytics/productivity'),
  getWorkload: () => apiClient.get('/analytics/workload'),

  // Activity
  getActivity: (params?: Record<string, unknown>) =>
    apiClient.get('/activity', { params }),
};

export default apiClient;
