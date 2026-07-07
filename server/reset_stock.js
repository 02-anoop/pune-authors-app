const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetStock() {
  const books = await prisma.book.findMany();
  let totalRestored = 0;

  for (const book of books) {
    let deducted = 0;

    const orderAgg = await prisma.orderItem.aggregate({
      where: {
        bookId: book.id,
        status: { in: ['Accepted', 'Dispatched', 'Completed', 'Delivered'] }
      },
      _sum: { quantity: true }
    });
    deducted += orderAgg._sum.quantity || 0;

    const donationAgg = await prisma.donationBook.aggregate({
      where: { bookId: book.id },
      _sum: { quantityDonated: true }
    });
    deducted += donationAgg._sum.quantityDonated || 0;

    const eventAgg = await prisma.eventBook.aggregate({
      where: { bookId: book.id },
      _sum: { listedStock: true }
    });
    deducted += eventAgg._sum.listedStock || 0;

    if (deducted > 0) {
      await prisma.book.update({
        where: { id: book.id },
        data: { stock: { increment: deducted } }
      });
      console.log(`Reset Book ID ${book.id} ("${book.title}"): Added ${deducted} back to stock.`);
      totalRestored += deducted;
    }
  }

  console.log(`\nStock reset complete. Total inventory units restored: ${totalRestored}`);
}

resetStock().catch(console.error).finally(() => prisma.$disconnect());
