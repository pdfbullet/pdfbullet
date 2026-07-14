import { NextResponse } from 'next/server';
import prisma from '../../../../utils/prisma';
import { getAuthenticatedUser } from '../../../../utils/apiAuth';

export async function POST(request: Request) {
  try {
    const { rating, message, page } = await request.json();

    if (rating === undefined || !message || !page) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const user = await getAuthenticatedUser(request);

    const feedback = await prisma.feedback.create({
      data: {
        rating: Number(rating),
        message,
        page,
        userId: user ? user.id : null,
        username: user ? user.username : 'Anonymous',
      }
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Submit feedback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const feedbacks = await prisma.feedback.findMany({
      orderBy: { timestamp: 'desc' }
    });

    const formattedFeedbacks = feedbacks.map(f => ({
      id: f.id,
      rating: f.rating,
      message: f.message,
      timestamp: { seconds: Math.floor(f.timestamp.getTime() / 1000) },
      userId: f.userId || 'Anonymous',
      username: f.username,
      page: f.page,
    }));

    return NextResponse.json({ feedbacks: formattedFeedbacks });
  } catch (error) {
    console.error('List feedbacks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Admin: delete a feedback entry
export async function DELETE(request: Request) {
  try {
    const admin = await getAuthenticatedUser(request);
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    await prisma.feedback.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete feedback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
