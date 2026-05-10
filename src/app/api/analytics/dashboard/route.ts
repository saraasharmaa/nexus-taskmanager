import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const totalProjects = await prisma.project.count();

    const totalTasks = await prisma.task.count();

    const completedTasks = await prisma.task.count({
      where: {
        status: 'COMPLETED',
      },
    });

    const pendingTasks = await prisma.task.count({
      where: {
        status: {
          not: 'COMPLETED',
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
      },
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
