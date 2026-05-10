import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const project = await prisma.project.findUnique({
      where: {
        id,
      },
      include: {
        tasks: true,
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

export async function PUT(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const body = await req.json();

    const updatedProject = await prisma.project.update({
      where: {
        id,
      },
      data: body,
    });

    return NextResponse.json({
      success: true,
      data: updatedProject,
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

export async function DELETE(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    await prisma.project.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Project deleted',
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
