const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const authors = await prisma.author.findMany();
  for (const a of authors) {
    if (a.extraData && JSON.stringify(a.extraData).includes('lateNotificationDate')) {
      console.log(`Author ID: ${a.id}, Name: ${a.name}, extraData:`, a.extraData);
    }
  }
}
main().finally(() => prisma.$disconnect());
