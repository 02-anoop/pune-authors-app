const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const books = await prisma.book.findMany({ take: 2, select: { id: true, title: true, mrp: true } });
  console.log(books);
}
main().finally(() => prisma.$disconnect());
