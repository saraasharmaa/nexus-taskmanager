// ============================================================
// NexusHQ — Shared Types & Interfaces
// ============================================================

export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'MEMBER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';

// ---- Auth ----
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  avatarColor: string;
  department?: string;
  title?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  name: string;
  password: string;
  role?: Role;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

// ---- Users ----
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  avatarColor: string;
  title?: string;
  department?: string;
  isActive: boolean;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assignedTasks: number;
    ownedProjects: number;
  };
}

// ---- Projects ----
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  healthScore: number;
  startDate?: string;
  deadline?: string;
  isArchived: boolean;
  ownerId: string;
  managerId?: string;
  teamId?: string;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  manager?: User;
  team?: Team;
  tasks?: Task[];
  milestones?: Milestone[];
  _count?: {
    tasks: number;
    completedTasks: number;
  };
}

export interface ProjectWithStats extends Project {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  progress: number;
  memberCount: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

// ---- Tasks ----
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  completedAt?: string;
  isArchived: boolean;
  sortOrder: number;
  projectId: string;
  assigneeId?: string;
  creatorId: string;
  milestoneId?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  project?: Project;
  assignee?: User;
  creator?: User;
  tags?: Tag[];
  comments?: Comment[];
  attachments?: Attachment[];
  subtasks?: Task[];
  _count?: {
    comments: number;
    attachments: number;
    subtasks: number;
  };
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  estimatedHours?: number;
  dueDate?: string;
  projectId: string;
  assigneeId?: string;
  milestoneId?: string;
  parentId?: string;
  tags?: string[];
}

export interface CreateProjectInput extends ProjectFormData {}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  actualHours?: number;
  sortOrder?: number;
}

// ---- Kanban ----
export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  color: string;
}

// ---- Comments ----
export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  author?: User;
}

// ---- Attachments ----
export interface Attachment {
  id: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  taskId: string;
  uploadedBy: string;
  createdAt: string;
  uploader?: User;
}

// ---- Teams ----
export interface Team {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  members?: TeamMember[];
  _count?: { members: number; projects: number };
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  joinedAt: string;
  user?: User;
}

// ---- Milestones ----
export interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  isCompleted: boolean;
  projectId: string;
  createdAt: string;
  tasks?: Task[];
}

// ---- Notifications ----
export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_COMPLETED'
  | 'TASK_OVERDUE'
  | 'DEADLINE_WARNING'
  | 'COMMENT_ADDED'
  | 'MENTION'
  | 'PROJECT_UPDATE'
  | 'STATUS_CHANGE';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  userId: string;
  linkUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ---- Activity ----
export interface ActivityLog {
  id: string;
  type: string;
  action: string;
  userId: string;
  projectId?: string;
  taskId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  user?: User;
  project?: Project;
  task?: Task;
}

// ---- Analytics ----
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  teamUtilization: number;
  avgHealthScore: number;
}

export interface ProductivityMetrics {
  userId: string;
  user: User;
  tasksCompleted: number;
  tasksInProgress: number;
  overdueCount: number;
  capacityUsed: number;
  completionRate: number;
}

export interface WorkloadData {
  userId: string;
  name: string;
  avatarColor: string;
  totalTasks: number;
  completedTasks: number;
  capacityPercent: number;
  isOverloaded: boolean;
}

// ---- API Responses ----
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ---- Tags ----
export interface Tag {
  id: string;
  name: string;
  color: string;
}

// ---- Zod schemas referenced in forms ----
export interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  projectId: string;
  assigneeId?: string;
  dueDate?: string;
  estimatedHours?: number;
  tags?: string[];
}

export interface ProjectFormData {
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  teamId?: string;
  managerId?: string;
  deadline?: string;
  startDate?: string;
}
