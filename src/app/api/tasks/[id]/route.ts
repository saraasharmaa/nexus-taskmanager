// src/app/api/tasks/[id]/route.ts
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { updateTaskSchema } from '@/lib/validations';
import { ok, notFound, forbidden, noContent, serverError } from '@/lib/api-utils';
import { TokenPayload } from '@/types';

type Ctx = { params: Promise<{ id: string }> };

// GET /api/tasks/:id
export const GET = withAuth(async (_req: NextRequest, ctx: Ctx) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: (await ctx.params).id },
      include: {
        project: { select: { id: true, name: true, status: true } },
        assignee: { select: { id: true, name: true, avatarColor: true, email: true } },
        creator: { select: { id: true, name: true, avatarColor: true } },
        milestone: true,
        tags: { include: { tag: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, name: true, avatarColor: true } } },
        },
        attachments: {
          include: { uploader: { select: { id: true, name: true } } },
        },
        subtasks: {
          include: {
            assignee: { select: { id: true, name: true, avatarColor: true } },
          },
        },
        activities: {
          take: 15,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true, avatarColor: true } } },
        },
      },
    });

    if (!task) return notFound('Task');
    return ok(task);
  } catch (err) {
    return serverError(err);
  }
});

// PUT /api/tasks/:id
export const PUT = withAuth(async (req: NextRequest, ctx: Ctx, user: TokenPayload) => {
  try {
    const existing = await prisma.task.findUnique({ where: { id: (await ctx.params).id } });
    if (!existing) return notFound('Task');

    // Members can only update their own assigned tasks (status, hours)
    if (user.role === 'MEMBER') {
      if (existing.assigneeId !== user.sub) return forbidden();
    }

    const body = await req.json();
    const data = updateTaskSchema.parse(body);
    const { tags, ...taskData } = data;

    const wasCompleted = existing.status !== 'COMPLETED' && data.status === 'COMPLETED';

    const task = await prisma.task.update({
      where: { id: (await ctx.params).id },
      data: {
        ...taskData,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        completedAt: wasCompleted ? new Date() : existing.completedAt,
        // Re-tag if provided
        ...(tags !== undefined && {
          tags: {
            deleteMany: {},
            create: await Promise.all(
              (tags || []).map(async (tagName: string) => {
                const tag = await prisma.tag.upsert({
                  where: { name: tagName },
                  update: {},
                  create: { name: tagName },
                });
                return { tagId: tag.id };
              })
            ),
          },
        }),
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, avatarColor: true } },
        tags: { include: { tag: true } },
      },
    });

    // Activity log
    const activityType = wasCompleted ? 'TASK_COMPLETED' : 'TASK_UPDATED';
    const action = wasCompleted
      ? `Completed task "${task.title}"`
      : `Updated task "${task.title}"`;

    await prisma.activityLog.create({
      data: {
        type: activityType,
        action,
        userId: user.sub,
        projectId: task.projectId,
        taskId: task.id,
        metadata: { changes: Object.keys(taskData) },
      },
    });

    // Audit trail
    await prisma.auditLog.create({
      data: {
        entity: 'Task',
        entityId: task.id,
        action: 'UPDATE',
        oldValues: existing as object,
        newValues: task as object,
        userId: user.sub,
      },
    });

    // Notify on status change
    if (data.status && data.status !== existing.status) {
      const projectMembers = await prisma.task.findMany({
        where: { projectId: task.projectId, assigneeId: { not: null } },
        select: { assigneeId: true },
        distinct: ['assigneeId'],
      });

      await prisma.notification.createMany({
        data: projectMembers
          .filter((m) => m.assigneeId && m.assigneeId !== user.sub)
          .map((m) => ({
            type: 'STATUS_CHANGE' as const,
            title: 'Task status updated',
            message: `"${task.title}" moved to ${data.status?.replace('_', ' ')}`,
            userId: m.assigneeId!,
            linkUrl: `/tasks/${task.id}`,
          })),
        skipDuplicates: true,
      });
    }

    // Notify assignee change
    if (data.assigneeId && data.assigneeId !== existing.assigneeId && data.assigneeId !== user.sub) {
      await prisma.notification.create({
        data: {
          type: 'TASK_ASSIGNED',
          title: 'Task assigned to you',
          message: `You've been assigned "${task.title}"`,
          userId: data.assigneeId,
          linkUrl: `/tasks/${task.id}`,
        },
      });
    }

    return ok(task);
  } catch (err) {
    return serverError(err);
  }
});

// DELETE /api/tasks/:id
export const DELETE = withAuth(
  async (_req: NextRequest, ctx: Ctx, user: TokenPayload) => {
    try {
      const existing = await prisma.task.findUnique({ where: { id: (await ctx.params).id } });
      if (!existing) return notFound('Task');

      if (user.role === 'MEMBER') return forbidden();

      await prisma.task.delete({ where: { id: (await ctx.params).id } });

      await prisma.activityLog.create({
        data: {
          type: 'TASK_UPDATED',
          action: `Deleted task "${existing.title}"`,
          userId: user.sub,
          projectId: existing.projectId,
        },
      });

      return noContent();
    } catch (err) {
      return serverError(err);
    }
  },
  ['ADMIN', 'PROJECT_MANAGER']
);
