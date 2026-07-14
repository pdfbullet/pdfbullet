const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('Seeding database...');

  const adminEmail = 'admin@pdfbullet.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        username: 'Admin User',
        passwordHash: hashPassword('password123'),
        isToolsPremium: true,
        isFlipbookPremium: true,
        isAdmin: true,
        apiPlan: 'business',
      }
    });
    console.log('Admin user created:', admin.email);
  } else {
    console.log('Admin user already exists.');
  }

  const guestEmail = 'guest@pdfbullet.com';
  const existingGuest = await prisma.user.findUnique({
    where: { email: guestEmail }
  });

  if (!existingGuest) {
    const guest = await prisma.user.create({
      data: {
        email: guestEmail,
        username: 'Guest User',
        passwordHash: hashPassword('guest123'),
        isToolsPremium: false,
        isFlipbookPremium: false,
        isAdmin: false,
        apiPlan: 'free',
      }
    });
    console.log('Guest user created:', guest.email);
  }

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
