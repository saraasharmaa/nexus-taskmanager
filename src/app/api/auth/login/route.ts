// src/app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  comparePasswords,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
} from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { ok, badRequest, serverError } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        avatarUrl: true,
        avatarColor: true,
        department: true,
        title: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return badRequest('Invalid email or password');
    }

    const valid = await comparePasswords(password, user.passwordHash);
    if (!valid) {
      return badRequest('Invalid email or password');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    const { passwordHash: _, ...safeUser } = user;
    void _;

    const response = ok({ user: safeUser, accessToken, refreshToken });
    setAuthCookies(response, accessToken, refreshToken);
    return response;
  } catch (err) {
    return serverError(err);
  }
}
