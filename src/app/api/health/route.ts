// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Quick DB ping
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '1.0.0',
      environment: process.env.NODE_ENV,
    });
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Database unreachable' },
      { status: 503 }
    );
  }
}
