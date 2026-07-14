import { NextResponse } from 'next/server';
import prisma from '../../../../utils/prisma';
import { getAuthenticatedUser } from '../../../../utils/apiAuth';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      include: { businessDetails: true },
      orderBy: { creationDate: 'desc' }
    });

    const formattedUsers = users.map(u => ({
      uid: u.id,
      username: u.username,
      email: u.email,
      profileImage: u.profileImage || undefined,
      isToolsPremium: u.isToolsPremium,
      isFlipbookPremium: u.isFlipbookPremium,
      creationDate: u.creationDate.toISOString(),
      apiKey: u.apiKey || undefined,
      apiPlan: u.apiPlan,
      firstName: u.firstName || undefined,
      lastName: u.lastName || undefined,
      country: u.country || undefined,
      twoFactorEnabled: u.twoFactorEnabled,
      businessDetails: u.businessDetails || undefined,
      trialEnds: u.trialEnds ? u.trialEnds.getTime() : null,
      isAdmin: u.isAdmin,
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const updateData: any = {};
    if (data.username !== undefined) updateData.username = data.username;
    if (data.profileImage !== undefined) updateData.profileImage = data.profileImage;
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.isToolsPremium !== undefined) updateData.isToolsPremium = data.isToolsPremium;
    if (data.isFlipbookPremium !== undefined) updateData.isFlipbookPremium = data.isFlipbookPremium;
    if (data.twoFactorEnabled !== undefined) updateData.twoFactorEnabled = data.twoFactorEnabled;
    if (data.apiPlan !== undefined) updateData.apiPlan = data.apiPlan;
    if (data.apiKey !== undefined) updateData.apiKey = data.apiKey;
    if (data.faceDescriptor !== undefined) {
      updateData.faceDescriptor = data.faceDescriptor ? JSON.stringify(data.faceDescriptor) : null;
    }

    // Handle nested businessDetails
    if (data.businessDetails) {
      await prisma.businessDetails.upsert({
        where: { userId: user.id },
        update: {
          companyName: data.businessDetails.companyName,
          vatId: data.businessDetails.vatId,
          country: data.businessDetails.country,
          stateProvince: data.businessDetails.stateProvince,
          city: data.businessDetails.city,
          address: data.businessDetails.address,
          zipCode: data.businessDetails.zipCode,
        },
        create: {
          userId: user.id,
          companyName: data.businessDetails.companyName,
          vatId: data.businessDetails.vatId,
          country: data.businessDetails.country,
          stateProvince: data.businessDetails.stateProvince,
          city: data.businessDetails.city,
          address: data.businessDetails.address,
          zipCode: data.businessDetails.zipCode,
        }
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      include: { businessDetails: true }
    });

    return NextResponse.json({
      user: {
        uid: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage || undefined,
        isToolsPremium: updatedUser.isToolsPremium,
        isFlipbookPremium: updatedUser.isFlipbookPremium,
        creationDate: updatedUser.creationDate.toISOString(),
        apiKey: updatedUser.apiKey || undefined,
        apiPlan: updatedUser.apiPlan,
        firstName: updatedUser.firstName || undefined,
        lastName: updatedUser.lastName || undefined,
        country: updatedUser.country || undefined,
        twoFactorEnabled: updatedUser.twoFactorEnabled,
        businessDetails: updatedUser.businessDetails || undefined,
        trialEnds: updatedUser.trialEnds ? updatedUser.trialEnds.getTime() : null,
        isAdmin: updatedUser.isAdmin,
      }
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');

    // Admin can delete anyone, normal users can only delete themselves
    const idToDelete = (user.isAdmin && targetUserId) ? targetUserId : user.id;

    await prisma.user.delete({
      where: { id: idToDelete }
    });

    const response = NextResponse.json({ success: true });

    // If user deleted themselves, clear cookie
    if (idToDelete === user.id) {
      response.cookies.set('token', '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/',
      });
    }

    return response;
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
