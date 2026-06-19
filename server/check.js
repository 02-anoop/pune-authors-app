const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const books = await prisma.book.findMany({
    select: { id: true, title: true, genre: true, subGenre: true, mrp: true, status: true },
    orderBy: { id: 'asc' }
  });
  console.log(`Total: ${books.length} books`);
  books.forEach(b => console.log(`  [${b.id}] "${b.title}" | ${b.genre} | subGenre: ${b.subGenre} | ₹${b.mrp} | ${b.status}`));
}

check().catch(console.error).finally(() => prisma.$disconnect());
