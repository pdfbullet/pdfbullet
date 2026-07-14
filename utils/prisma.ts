import { PrismaClient } from '@prisma/client';
import path from 'path';

let prisma: PrismaClient;

const databaseUrl = `file:${path.resolve(process.cwd(), 'prisma/dev.db')}`;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  });
} else {
  // Prevent multiple instances of Prisma Client in development
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    });
  }
  prisma = (global as any).prisma;
}

export default prisma;
