// src/app/api/auth/logout/route.ts
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, clearAuthCookies } from '@/lib/auth';
import { ok, serverError } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    const refreshToken = req.cookies.get('refresh_token')?.value;

    if (user && refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken, userId: user.sub },
      });
    }

    const response = ok({ message: 'Logged out successfully' });
    clearAuthCookies(response);
    return response;
  } catch (err) {
    return serverError(err);
  }
}
