import { NextResponse } from 'next/server';
import prisma from '../../../../../utils/prisma';
import { hashPassword } from '../../../../../utils/auth';
import { signToken } from '../../../../../utils/jwt';

export async function POST(request: Request) {
  try {
    const { email, username, password } = await request.json();

    if (!email || !username || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const passwordHash = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        isToolsPremium: false,
        isFlipbookPremium: false,
        apiPlan: 'free',
        isAdmin: false,
      }
    });

    const token = signToken({ id: user.id, email: user.email, isAdmin: user.isAdmin });

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
        businessDetails: null,
        trialEnds: null,
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
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
