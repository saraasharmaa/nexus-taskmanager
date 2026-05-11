import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const projects = await prisma.project.findMany({
      include: {
        tasks: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: projects,
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description || null,
        priority: body.priority || "MEDIUM",
        deadline: body.deadline ? new Date(body.deadline) : null,
        owner: {
          connect: {
            id: "cmp019e6t000013h0uny6p1cj",
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: project,
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
