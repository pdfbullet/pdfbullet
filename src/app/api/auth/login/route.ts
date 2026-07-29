import { NextResponse } from 'next/server';
import prisma from '../../../../../utils/prisma';
import { comparePassword } from '../../../../../utils/auth';
import { signToken } from '../../../../../utils/jwt';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { businessDetails: true }
    });

    if (!user || !comparePassword(password, user.passwordHash)) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = signToken({ id: user.id, email: user.email, isAdmin: user.isAdmin });

    // Set cookie
    const response = NextResponse.json({
      user: {
        uid: user.id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        isToolsPremium: user.isToolsPremium,
        isFlipbookPremium: user.isFlipbookPremium,
        creationDate: user.creationDate.toISOString(),
        apiKey: user.apiKey,
        apiPlan: user.apiPlan,
        firstName: user.firstName,
        lastName: user.lastName,
        country: user.country,
        twoFactorEnabled: user.twoFactorEnabled,
        businessDetails: user.businessDetails,
        trialEnds: user.trialEnds ? user.trialEnds.getTime() : null,
        isAdmin: user.isAdmin,
      }
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
