import { NextResponse } from 'next/server';
import prisma from '../../../../utils/prisma';
import { getAuthenticatedUser } from '../../../../utils/apiAuth';

export async function POST(request: Request) {
  try {
    const { email, url, problemType, description } = await request.json();

    if (!email || !url || !problemType || !description) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const user = await getAuthenticatedUser(request);

    const report = await prisma.problemReport.create({
      data: {
        email,
        url,
        problemType,
        description,
        userId: user ? user.id : null,
        status: 'New',
      }
    });

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const reports = await prisma.problemReport.findMany({
      orderBy: { timestamp: 'desc' },
      include: { user: true }
    });

    // Format to match UI expected ProblemReport structure
    const formattedReports = reports.map(r => ({
      id: r.id,
      email: r.email,
      url: r.url,
      problemType: r.problemType,
      description: r.description,
      status: r.status,
      timestamp: { seconds: Math.floor(r.timestamp.getTime() / 1000) },
      userId: r.userId || undefined,
      userName: r.user?.username || undefined,
      notes: r.notes || undefined,
    }));

    return NextResponse.json({ reports: formattedReports });
  } catch (error) {
    console.error('List reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
