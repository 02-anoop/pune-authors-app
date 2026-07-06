const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Fetch all existing donation registrations and their books
  const registrations = await prisma.donationRegistration.findMany({
    include: {
      author: true,
      books: {
        include: { book: true }
      }
    }
  });

  console.log(`Starting stock restoration for ${registrations.length} registrations...`);

  let restoredCount = 0;
  for (const reg of registrations) {
    console.log(`\nProcessing Registration ID ${reg.id} for Author: ${reg.author.name}`);
    
    // For each book in this registration, restore the stock
    for (const regBook of reg.books) {
      if (regBook.book) {
        console.log(`-> Restoring stock for book "${regBook.book.title}" (ID: ${regBook.bookId}): Current stock = ${regBook.book.stock} | Restoring = +${regBook.quantityDonated}`);
        
        await prisma.book.update({
          where: { id: regBook.bookId },
          data: {
            stock: {
              increment: regBook.quantityDonated
            }
          }
        });
        
        restoredCount++;
      } else {
        console.log(`-> Warning: Book record not found for BookID: ${regBook.bookId}`);
      }
    }

    // Set isManual: true for this registration in the database
    await prisma.donationRegistration.update({
      where: { id: reg.id },
      data: { isManual: true }
    });
  }

  console.log(`\nFinished! Restored stock for ${restoredCount} book records across ${registrations.length} registrations.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
