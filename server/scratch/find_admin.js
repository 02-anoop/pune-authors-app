require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const admins = await p.user.findMany({ where: { role: 'ADMIN' }, select: { id: true, name: true, email: true, role: true } });
  console.log('Admin users in DB:');
  console.table(admins);
  await p.$disconnect();
}
main();
