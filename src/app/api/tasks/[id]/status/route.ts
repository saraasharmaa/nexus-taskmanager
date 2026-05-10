// src/app/api/tasks/[id]/status/route.ts
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { updateTaskStatusSchema } from '@/lib/validations';
import { ok, notFound, forbidden, serverError } from '@/lib/api-utils';
import { TokenPayload } from '@/types';

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withAuth(async (req: NextRequest, ctx: Ctx, user: TokenPayload) => {
  try {
    const existing = await prisma.task.findUnique({ where: { id: (await ctx.params).id } });
    if (!existing) return notFound('Task');

    // Members can only update tasks assigned to them
    if (user.role === 'MEMBER' && existing.assigneeId !== user.sub) {
      return forbidden('You can only update tasks assigned to you');
    }

    const body = await req.json();
    const { status, sortOrder } = updateTaskStatusSchema.parse(body);

    const wasCompleted = existing.status !== 'COMPLETED' && status === 'COMPLETED';

    const task = await prisma.task.update({
      where: { id: (await ctx.params).id },
      data: {
        status,
        sortOrder: sortOrder ?? existing.sortOrder,
        completedAt: wasCompleted ? new Date() : existing.completedAt,
      },
      include: {
        assignee: { select: { id: true, name: true, avatarColor: true } },
        project: { select: { id: true, name: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        type: wasCompleted ? 'TASK_COMPLETED' : 'STATUS_CHANGED',
        action: `${wasCompleted ? 'Completed' : 'Updated status of'} "${task.title}" to ${status.replace('_', ' ')}`,
        userId: user.sub,
        projectId: task.projectId,
        taskId: task.id,
      },
    });

    return ok(task);
  } catch (err) {
    return serverError(err);
  }
});
