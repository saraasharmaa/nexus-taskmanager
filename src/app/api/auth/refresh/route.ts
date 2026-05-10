// src/app/api/auth/refresh/route.ts
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
} from '@/lib/auth';
import { ok, unauthorized, serverError } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('refresh_token')?.value;
    if (!token) return unauthorized('No refresh token');

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return unauthorized('Invalid or expired refresh token');
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      return unauthorized('Refresh token expired or revoked');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) return unauthorized('User not found');

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { token } });

    const newPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(newPayload);
    const refreshToken = generateRefreshToken(newPayload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const response = ok({ accessToken });
    setAuthCookies(response, accessToken, refreshToken);
    return response;
  } catch (err) {
    return serverError(err);
  }
}
