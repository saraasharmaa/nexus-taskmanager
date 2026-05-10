// src/app/api/tasks/[id]/comments/route.ts
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { createCommentSchema } from '@/lib/validations';
import { ok, created, notFound, serverError } from '@/lib/api-utils';
import { TokenPayload } from '@/types';

type Ctx = { params: Promise<{ id: string }> };

export const GET = withAuth(async (_req: NextRequest, ctx: Ctx) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: (await ctx.params).id } });
    if (!task) return notFound('Task');

    const comments = await prisma.comment.findMany({
      where: { taskId: (await ctx.params).id },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { id: true, name: true, avatarColor: true } },
      },
    });

    return ok(comments);
  } catch (err) {
    return serverError(err);
  }
});

export const POST = withAuth(async (req: NextRequest, ctx: Ctx, user: TokenPayload) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: (await ctx.params).id } });
    if (!task) return notFound('Task');

    const body = await req.json();
    const { content } = createCommentSchema.parse({ ...body, taskId: (await ctx.params).id });

    const comment = await prisma.comment.create({
      data: { content, taskId: (await ctx.params).id, authorId: user.sub },
      include: {
        author: { select: { id: true, name: true, avatarColor: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        type: 'TASK_COMMENTED',
        action: `Commented on "${task.title}"`,
        userId: user.sub,
        projectId: task.projectId,
        taskId: task.id,
      },
    });

    // Notify task assignee
    if (task.assigneeId && task.assigneeId !== user.sub) {
      await prisma.notification.create({
        data: {
          type: 'COMMENT_ADDED',
          title: 'New comment',
          message: `Someone commented on "${task.title}"`,
          userId: task.assigneeId,
          linkUrl: `/tasks/${task.id}`,
        },
      });
    }

    return created(comment);
  } catch (err) {
    return serverError(err);
  }
});
