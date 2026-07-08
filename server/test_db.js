const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log("authors", await prisma.author.count({ where: { status: 'Approved' } }));
    console.log("books", await prisma.book.count({ where: { status: 'Approved' } }));
    console.log("events", await prisma.event.count());
    console.log("libraries", await prisma.library.count());
    console.log("Success");
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
