// src/lib/api-utils.ts
// Centralized API response helpers and error handling

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

// ---- Standard Response Builders ----

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T): NextResponse {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(error: string): NextResponse {
  return NextResponse.json({ success: false, error }, { status: 400 });
}

export function unauthorized(error = 'Authentication required'): NextResponse {
  return NextResponse.json({ success: false, error }, { status: 401 });
}

export function forbidden(error = 'Insufficient permissions'): NextResponse {
  return NextResponse.json({ success: false, error }, { status: 403 });
}

export function notFound(resource = 'Resource'): NextResponse {
  return NextResponse.json(
    { success: false, error: `${resource} not found` },
    { status: 404 }
  );
}

export function conflict(error: string): NextResponse {
  return NextResponse.json({ success: false, error }, { status: 409 });
}

export function serverError(error: unknown): NextResponse {
  console.error('[API Error]', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        details: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  // Prisma known errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return conflict('A record with this value already exists');
      case 'P2025':
        return notFound();
      case 'P2003':
        return badRequest('Related record not found');
      default:
        return NextResponse.json(
          { success: false, error: 'Database error', code: error.code },
          { status: 500 }
        );
    }
  }

  // Generic error
  const message =
    process.env.NODE_ENV === 'development'
      ? error instanceof Error
        ? error.message
        : 'Internal server error'
      : 'Internal server error';

  return NextResponse.json({ success: false, error: message }, { status: 500 });
}

// ---- Pagination ----

export function paginate<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

// ---- Query Parsing ----

export function parseSearchParams(url: string): Record<string, string> {
  const { searchParams } = new URL(url);
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

// ---- Rate Limiting (in-memory, use Redis in prod) ----

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

// ---- Sanitize User Output ----

export function sanitizeUser(user: Record<string, unknown>) {
  const { passwordHash, ...safe } = user;
  void passwordHash;
  return safe;
}

// ---- Health Score Calculator ----

export function calculateProjectHealth(
  totalTasks: number,
  completedTasks: number,
  overdueTasks: number,
  daysUntilDeadline: number
): number {
  if (totalTasks === 0) return 100;

  const completionScore = (completedTasks / totalTasks) * 40;
  const overdueScore = Math.max(0, 30 - (overdueTasks / totalTasks) * 30);
  const deadlineScore =
    daysUntilDeadline < 0
      ? 0
      : daysUntilDeadline < 7
      ? 15
      : daysUntilDeadline < 14
      ? 25
      : 30;

  return Math.round(completionScore + overdueScore + deadlineScore);
}

// ---- Risk Level Calculator ----

export function calculateRiskLevel(
  healthScore: number,
  overdueTasks: number,
  daysUntilDeadline: number
): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (healthScore < 50 || overdueTasks > 5 || daysUntilDeadline < 0) return 'HIGH';
  if (healthScore < 70 || overdueTasks > 2 || daysUntilDeadline < 7) return 'MEDIUM';
  return 'LOW';
}
