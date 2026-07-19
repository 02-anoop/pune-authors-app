const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const authors = await prisma.author.count({ where: { status: 'Active' } });
    console.log("authors OK");
    const books = await prisma.book.count({ where: { status: 'Approved' } });
    console.log("books OK");
    const genres = await prisma.book.findMany({ select: { genre: true }, distinct: ['genre'], where: { status: 'Approved' } });
    console.log("genres OK");
    const events = await prisma.event.count();
    console.log("events OK");
    const libraries = await prisma.library.count();
    console.log("libraries OK");
    const donationAgg = await prisma.donationBook.aggregate({
      _sum: { quantityDonated: true }
    });
    console.log("donationAgg OK");
    const rawSettings = await prisma.systemSetting.findMany({
      where: { key: { in: ['manualAuthorsCount', 'manualBooksCount', 'manualEventsCount', 'manualDonatedBooksCount'] } }
    });
    console.log("rawSettings OK");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
test();
