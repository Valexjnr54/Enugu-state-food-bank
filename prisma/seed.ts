// prisma/seed.ts

import { PrismaClient } from '../src/models';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = 'password'; // Change as needed
  const hashedPassword = await argon2.hash(defaultPassword);
  const defaultProfileImage = 'https://example.com/default-profile.png';

  await prisma.admin.create({
    data: {
      firstname: 'Super',
      lastname: 'Admin',
      email: 'admin@example.com',
      username: 'super_admin',
      role: 'super_admin', // or Role.admin if needed
      profile_image: defaultProfileImage,
      password: hashedPassword,
    },
  });

  console.log('✅ Admin seed complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
