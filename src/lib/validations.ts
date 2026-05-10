// src/lib/validations.ts
// Zod schemas for all API inputs — single source of truth for validation

import { z } from 'zod';

// ---- Auth ----

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  role: z.enum(['ADMIN', 'PROJECT_MANAGER', 'MEMBER']).optional(),
  department: z.string().optional(),
  title: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

// ---- Users ----

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  title: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  avatarColor: z.string().optional(),
  role: z.enum(['ADMIN', 'PROJECT_MANAGER', 'MEMBER']).optional(),
  isActive: z.boolean().optional(),
});

// ---- Projects ----

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name required').max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  teamId: z.string().optional(),
  managerId: z.string().optional(),
  deadline: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  healthScore: z.number().min(0).max(100).optional(),
  isArchived: z.boolean().optional(),
});

// ---- Tasks ----

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title required').max(500),
  description: z.string().max(5000).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  estimatedHours: z.number().positive().optional(),
  dueDate: z.string().optional(),
  projectId: z.string().min(1, 'Project is required'),
  assigneeId: z.string().optional(),
  milestoneId: z.string().optional(),
  parentId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sortOrder: z.number().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  actualHours: z.number().positive().optional(),
  isArchived: z.boolean().optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']),
  sortOrder: z.number().optional(),
});

export const bulkUpdateTasksSchema = z.object({
  taskIds: z.array(z.string()),
  updates: updateTaskSchema,
});

// ---- Comments ----

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(5000),
  taskId: z.string().min(1),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});

// ---- Teams ----

export const createTeamSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  color: z.string().optional(),
});

export const addTeamMemberSchema = z.object({
  userId: z.string(),
  teamId: z.string(),
});

// ---- Milestones ----

export const createMilestoneSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  dueDate: z.string(),
  projectId: z.string(),
});

// ---- Tags ----

export const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().optional(),
});

// ---- Pagination ----

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// ---- Task Filters ----

export const taskFiltersSchema = paginationSchema.extend({
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  assigneeId: z.string().optional(),
  projectId: z.string().optional(),
  overdue: z.coerce.boolean().optional(),
  tags: z.string().optional(),
});

// ---- Project Filters ----

export const projectFiltersSchema = paginationSchema.extend({
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  teamId: z.string().optional(),
  archived: z.coerce.boolean().optional(),
});

// Export inferred types
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type TaskFilters = z.infer<typeof taskFiltersSchema>;
export type ProjectFilters = z.infer<typeof projectFiltersSchema>;
