// src/app/api/users/[id]/route.ts
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { updateUserSchema } from '@/lib/validations';
import { ok, notFound, forbidden, serverError } from '@/lib/api-utils';
import { TokenPayload } from '@/types';

type Ctx = { params: Promise<{ id: string }> };

export const GET = withAuth(async (_req: NextRequest, ctx: Ctx) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (await ctx.params).id },
      select: {
        id: true, email: true, name: true, role: true,
        avatarUrl: true, avatarColor: true, title: true,
        department: true, isActive: true, lastActiveAt: true, createdAt: true,
        _count: { select: { assignedTasks: true, ownedProjects: true } },
      },
    });
    if (!user) return notFound('User');
    return ok(user);
  } catch (err) {
    return serverError(err);
  }
});

export const PUT = withAuth(async (req: NextRequest, ctx: Ctx, authUser: TokenPayload) => {
  try {
    // Users can edit own profile; admins can edit any
    if (authUser.sub !== (await ctx.params).id && authUser.role !== 'ADMIN') {
      return forbidden('You can only edit your own profile');
    }

    const body = await req.json();
    const data = updateUserSchema.parse(body);

    // Only admins can change roles
    if (data.role && authUser.role !== 'ADMIN') {
      return forbidden('Only admins can change roles');
    }

    const user = await prisma.user.update({
      where: { id: (await ctx.params).id },
      data,
      select: {
        id: true, email: true, name: true, role: true,
        avatarUrl: true, avatarColor: true, title: true,
        department: true, isActive: true,
      },
    });

    return ok(user);
  } catch (err) {
    return serverError(err);
  }
});
