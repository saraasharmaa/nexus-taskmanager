// src/app/api/tasks/route.ts
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { createTaskSchema, taskFiltersSchema } from '@/lib/validations';
import { ok, created, serverError, paginate, parseSearchParams } from '@/lib/api-utils';
import { TokenPayload } from '@/types';

// GET /api/tasks
export const GET = withAuth(async (req: NextRequest, _ctx, user: TokenPayload) => {
  try {
    const params = parseSearchParams(req.url);
    const filters = taskFiltersSchema.parse(params);
    const { page, limit, search, status, priority, assigneeId, projectId, overdue, tags } = filters;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      isArchived: false,
      // Members only see their assigned tasks unless they're admin/PM
      ...(user.role === 'MEMBER' && { assigneeId: user.sub }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assigneeId && { assigneeId }),
      ...(projectId && { projectId }),
      ...(overdue && {
        dueDate: { lt: new Date() },
        status: { not: 'COMPLETED' },
      }),
      ...(tags && {
        tags: { some: { tag: { name: { in: tags.split(',') } } } },
      }),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { dueDate: 'asc' }],
        include: {
          project: { select: { id: true, name: true, status: true } },
          assignee: { select: { id: true, name: true, avatarColor: true, email: true } },
          creator: { select: { id: true, name: true, avatarColor: true } },
          tags: { include: { tag: true } },
          _count: { select: { comments: true, attachments: true, subtasks: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return ok(paginate(tasks, total, page, limit));
  } catch (err) {
    return serverError(err);
  }
});

// POST /api/tasks
export const POST = withAuth(async (req: NextRequest, _ctx, user: TokenPayload) => {
  try {
    const body = await req.json();
    const data = createTaskSchema.parse(body);
    const { tags, ...taskData } = data;

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: taskData.projectId } });
    if (!project) return ok({ error: 'Project not found' }, 404);

    // Members can't create tasks
    if (user.role === 'MEMBER') {
      const { forbidden } = await import('@/lib/api-utils');
      return forbidden('Members cannot create tasks');
    }

    const task = await prisma.task.create({
      data: {
        ...taskData,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        creatorId: user.sub,
        tags: tags?.length
          ? {
              create: await Promise.all(
                tags.map(async (tagName) => {
                  const tag = await prisma.tag.upsert({
                    where: { name: tagName },
                    update: {},
                    create: { name: tagName },
                  });
                  return { tagId: tag.id };
                })
              ),
            }
          : undefined,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, avatarColor: true } },
        creator: { select: { id: true, name: true, avatarColor: true } },
        tags: { include: { tag: true } },
      },
    });

    // Activity log
    await prisma.activityLog.create({
      data: {
        type: 'TASK_CREATED',
        action: `Created task "${task.title}"`,
        userId: user.sub,
        projectId: task.projectId,
        taskId: task.id,
      },
    });

    // Notify assignee
    if (task.assigneeId && task.assigneeId !== user.sub) {
      await prisma.notification.create({
        data: {
          type: 'TASK_ASSIGNED',
          title: 'New task assigned',
          message: `You've been assigned "${task.title}" in ${task.project?.name}`,
          userId: task.assigneeId,
          linkUrl: `/tasks/${task.id}`,
          metadata: { taskId: task.id, projectId: task.projectId },
        },
      });
    }

    return created(task);
  } catch (err) {
    return serverError(err);
  }
});
