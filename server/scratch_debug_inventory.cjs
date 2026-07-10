const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testInventory() {
  try {
    const whereClause = {};
    const skip = 0;
    const limit = 50;

    console.log("Fetching books...");
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: whereClause,
        include: { author: { select: { name: true } } },
        orderBy: [{ stock: 'asc' }, { title: 'asc' }],
        skip,
        take: Number(limit)
      }),
      prisma.book.count({ where: whereClause })
    ]);
    console.log("Books fetched:", books.length);

    console.log("Fetching global total titles...");
    const globalTotalTitles = await prisma.book.count({ where: {} });
    console.log("Global total titles:", globalTotalTitles);

    console.log("Fetching all books...");
    const allBooks = await prisma.book.findMany({
      include: { author: { select: { name: true } } }
    });
    console.log("All books fetched:", allBooks.length);
    
    // Now let's try the computeBookInventory logic
    console.log("Testing computeBookInventory...");
    const bookIds = allBooks.map(b => b.id);
    const CUTOFF_DATE = new Date('2026-07-08T00:00:00Z');

    console.log("orderItemAgg...");
    const orderItemAgg = await prisma.orderItem.groupBy({
      by: ['bookId'],
      where: { 
        bookId: { in: bookIds },
        status: { in: ['Accepted', 'Dispatched', 'Completed', 'Delivered'] },
        createdAt: { gte: CUTOFF_DATE }
      },
      _sum: { quantity: true },
      _max: { createdAt: true }
    });

    console.log("donationAgg...");
    const donationAgg = await prisma.donationBook.groupBy({
      by: ['bookId'],
      where: { 
        bookId: { in: bookIds },
        createdAt: { gte: CUTOFF_DATE }
      },
      _sum: { quantityDonated: true },
      _max: { createdAt: true }
    });

    console.log("eventBooksRaw...");
    const eventBooksRaw = await prisma.eventBook.findMany({
      where: {
        bookId: { in: bookIds },
        event: {
          status: { not: 'Legacy Archive' },
          livePosEnabled: true
        }
      },
      include: {
        event: { select: { id: true, name: true, location: true, status: true } }
      }
    });

    console.log("eventAgg...");
    const eventAgg = await prisma.eventBook.groupBy({
      by: ['bookId'],
      where: { bookId: { in: bookIds } },
      _max: { createdAt: true }
    });

    console.log("stockHistoryList...");
    const stockHistoryList = await prisma.stockHistory.findMany({
      where: { bookId: { in: bookIds } },
      orderBy: { updatedAt: 'desc' }
    });

    console.log("donationBooksRaw...");
    const donationBooksRaw = await prisma.donationBook.findMany({
      where: { 
        bookId: { in: bookIds },
        createdAt: { gte: CUTOFF_DATE }
      },
      include: {
        registration: {
          include: {
            announcement: { include: { library: { select: { id: true, name: true, city: true } } } }
          }
        }
      }
    });

    console.log("Everything executed successfully");

  } catch (err) {
    console.error("Error occurred:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testInventory();
