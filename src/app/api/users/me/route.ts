// src/app/api/users/me/route.ts
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { ok, notFound, serverError } from '@/lib/api-utils';
import { TokenPayload } from '@/types';

export const GET = withAuth(async (_req: NextRequest, _ctx, user: TokenPayload) => {
  try {
    const me = await prisma.user.findUnique({
      where: { id: user.sub },
      select: {
        id: true, email: true, name: true, role: true,
        avatarUrl: true, avatarColor: true, title: true,
        department: true, isActive: true, lastActiveAt: true,
        createdAt: true,
        _count: {
          select: { assignedTasks: true, ownedProjects: true, teamMemberships: true },
        },
      },
    });

    if (!me) return notFound('User');

    await prisma.user.update({
      where: { id: user.sub },
      data: { lastActiveAt: new Date() },
    });

    return ok(me);
  } catch (err) {
    return serverError(err);
  }
});
