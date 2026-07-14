import { NextResponse } from 'next/server';
import prisma from '../../../../../utils/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 404 });
    }

    if (!user.faceDescriptor) {
      return NextResponse.json({ error: 'Face Login is not set up for this account' }, { status: 404 });
    }

    const faceDescriptor = JSON.parse(user.faceDescriptor);

    return NextResponse.json({ faceDescriptor });
  } catch (error) {
    console.error('Fetch face descriptor error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
