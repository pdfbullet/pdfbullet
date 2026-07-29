import { verifyToken } from './jwt';
import prisma from './prisma';

export async function getAuthenticatedUser(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/token=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token) {
      console.warn("getAuthenticatedUser: No token found in cookies.");
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      console.warn("getAuthenticatedUser: Token verification failed or decoded payload is invalid.");
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { businessDetails: true }
    });

    if (!user) {
      console.warn(`getAuthenticatedUser: User with ID ${decoded.id} not found in database.`);
      return null;
    }

    return user;
  } catch (e: any) {
    console.error("getAuthenticatedUser error:", e);
    return null;
  }
}
