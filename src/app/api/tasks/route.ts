import { NextResponse } from 'next/server';
import prisma from '../../../../utils/prisma';
import { getAuthenticatedUser } from '../../../../utils/apiAuth';

export async function POST(request: Request) {
  try {
    const { toolId, toolTitle, outputFilename, fileSize } = await request.json();

    if (!toolId || !toolTitle || !outputFilename) {
      return NextResponse.json({ error: 'Missing log data' }, { status: 400 });
    }

    const user = await getAuthenticatedUser(request);

    const log = await prisma.taskLog.create({
      data: {
        toolId,
        toolTitle,
        outputFilename,
        fileSize: fileSize || 0,
        userId: user ? user.id : null,
        username: user ? user.username : 'Guest',
      }
    });

    return NextResponse.json({ log });
  } catch (error) {
    console.error('Log task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const logs = await prisma.taskLog.findMany({
      orderBy: { timestamp: 'desc' },
      include: { user: true }
    });

    const formattedLogs = logs.map(l => ({
      id: l.id,
      userId: l.userId || 'Guest',
      username: l.username,
      toolId: l.toolId,
      toolTitle: l.toolTitle,
      outputFilename: l.outputFilename,
      timestamp: { seconds: Math.floor(l.timestamp.getTime() / 1000) },
      fileSize: l.fileSize,
    }));

    return NextResponse.json({ taskLogs: formattedLogs });
  } catch (error) {
    console.error('List tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Admin: delete a task log record
export async function DELETE(request: Request) {
  try {
    const admin = await getAuthenticatedUser(request);
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    await prisma.taskLog.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
