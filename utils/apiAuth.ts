import { verifyToken } from './jwt';
import prisma from './prisma';

export async function getAuthenticatedUser(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/token=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { businessDetails: true }
    });

    return user;
  } catch (e) {
    return null;
  }
}
