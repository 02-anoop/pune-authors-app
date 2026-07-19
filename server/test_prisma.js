const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const skip = 0;
    const limit = 50;
    const [authors, total] = await Promise.all([
      prisma.author.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          state: true,
          status: true,
          createdAt: true,
          _count: {
             select: { books: true, eventRegistrations: true, eventAuthors: true }
          },
          eventAuthors: {
             select: {
                eventId: true,
                optInStatus: true,
                event: { select: { name: true, date: true } }
             }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.author.count()
    ]);
    console.log("Success! Authors:", authors.length, "Total:", total);
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
