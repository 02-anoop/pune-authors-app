const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const author = await prisma.author.update({
    where: { email: 'bindu13@gmail.com' },
    data: { status: 'Pending' }
  });
  console.log('Successfully reverted author status to:', author.status);
}
main().catch(console.error).finally(() => prisma.$disconnect());
