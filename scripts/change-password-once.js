const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const EMAIL = 'andrebalao26@gmail.com';
const NEW_PASSWORD = 'A15fa11dd!';

async function main() {
  const hash = await bcrypt.hash(NEW_PASSWORD, 10);
  const prisma = new PrismaClient();
  await prisma.user.update({
    where: { email: EMAIL },
    data: { password: hash },
  });
  console.log('Password changed for', EMAIL);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
