const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const regs = await prisma.donationRegistration.findMany({
    include: {
      author: { select: { name: true, email: true } },
      books: {
        include: { book: { select: { title: true } } }
      }
    }
  });

  console.log("Total Registrations:", regs.length);
  for (const r of regs) {
    console.log(`ID: ${r.id} | Author: ${r.author.name} | Screenshot: ${r.paymentScreenshot} | TxId: ${r.transactionId} | Status: ${r.status} | Books:`, r.books.map(b => `${b.book.title} (Qty: ${b.quantityDonated})`).join(', '));
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
