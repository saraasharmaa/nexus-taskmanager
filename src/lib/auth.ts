// src/lib/auth.ts
// JWT authentication — token generation, verification, and middleware

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { TokenPayload, Role } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in environment variables');
}

// ---- Token Generation ----

export function generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function generateRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
}

// ---- Password Hashing ----

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePasswords(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

// ---- Request Auth Extraction ----

export function extractTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  // Also check cookies for SSR
  const cookieToken = req.cookies.get('access_token')?.value;
  return cookieToken || null;
}

export function getAuthUser(req: NextRequest): TokenPayload | null {
  const token = extractTokenFromRequest(req);
  if (!token) return null;
  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

// ---- Route Protection HOF ----

type RouteHandler = (
  req: NextRequest,
  context: any,
  user: TokenPayload
) => Promise<NextResponse>;

export function withAuth(handler: RouteHandler, allowedRoles?: Role[]) {
  return async (req: NextRequest, context: any) => {
    const user = getAuthUser(req);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return handler(req, context, user);
  };
}

// ---- Role Checks ----

export function isAdmin(role: Role): boolean {
  return role === 'ADMIN';
}

export function isAdminOrManager(role: Role): boolean {
  return role === 'ADMIN' || role === 'PROJECT_MANAGER';
}

// ---- Cookie Helpers ----

export function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string): void {
  const isProd = process.env.NODE_ENV === 'production';

  response.cookies.set('access_token', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  });

  response.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set('access_token', '', { maxAge: 0 });
  response.cookies.set('refresh_token', '', { maxAge: 0 });
}
