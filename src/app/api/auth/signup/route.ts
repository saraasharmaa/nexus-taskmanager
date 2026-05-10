// src/app/api/auth/signup/route.ts
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  hashPassword,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
} from '@/lib/auth';
import { signupSchema } from '@/lib/validations';
import { created, conflict, serverError } from '@/lib/api-utils';

const AVATAR_COLORS = [
  '#4f7bef', '#a855f7', '#22c55e', '#14b8a6',
  '#f59e0b', '#ef4444', '#ec4899', '#06b6d4',
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = signupSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      return conflict('An account with this email already exists');
    }

    const passwordHash = await hashPassword(data.password);
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        passwordHash,
        role: data.role ?? 'MEMBER',
        avatarColor,
        department: data.department,
        title: data.title,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        avatarColor: true,
        department: true,
        title: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'MEMBER_JOINED',
        action: `${user.name} joined the workspace`,
        userId: user.id,
      },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const response = created({ user, accessToken, refreshToken });
    setAuthCookies(response, accessToken, refreshToken);
    return response;
  } catch (err) {
    return serverError(err);
  }
}
