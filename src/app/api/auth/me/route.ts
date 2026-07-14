import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '../../../../../utils/prisma';
import { verifyToken } from '../../../../../utils/jwt';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { businessDetails: true }
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
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
  } catch (error: any) {
    console.error('Session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
