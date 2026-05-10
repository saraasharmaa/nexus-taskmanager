// src/app/api/users/route.ts
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { updateUserSchema, paginationSchema } from '@/lib/validations';
import { ok, serverError, paginate, parseSearchParams } from '@/lib/api-utils';
import { TokenPayload } from '@/types';

// GET /api/users — Admin/PM only
export const GET = withAuth(async (req: NextRequest, _ctx, user: TokenPayload) => {
  try {
    const params = parseSearchParams(req.url);
    const { page, limit, search } = paginationSchema.parse(params);
    const skip = (page - 1) * limit;

    const where = {
      ...(user.role === 'MEMBER' && { id: user.sub }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { department: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true, email: true, name: true, role: true,
          avatarUrl: true, avatarColor: true, title: true,
          department: true, isActive: true, lastActiveAt: true,
          createdAt: true,
          _count: { select: { assignedTasks: true, ownedProjects: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return ok(paginate(users, total, page, limit));
  } catch (err) {
    return serverError(err);
  }
});

// src/app/api/users/me/route.ts — inline for brevity
