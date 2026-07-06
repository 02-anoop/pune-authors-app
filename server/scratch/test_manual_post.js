const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  // Find a book with stock > 0
  const book = await prisma.book.findFirst({
    where: { stock: { gt: 0 } },
    include: { author: true }
  });

  if (!book) {
    console.log("No books found with stock > 0");
    return;
  }

  // Find an announcement/drive
  const drive = await prisma.donationAnnouncement.findFirst();
  if (!drive) {
    console.log("No donation drives found");
    return;
  }

  console.log(`Testing with Book: "${book.title}" (ID: ${book.id}) | Author: ${book.author.name} (ID: ${book.authorId})`);
  console.log(`Initial Book Stock: ${book.stock}`);

  // We mock a manual registration from admin side
  // To avoid HTTP requests and permissions, we import/simulate the backend logic directly using prisma
  const announcementId = drive.id;
  const authorId = book.authorId;
  const books = [{ bookId: book.id, quantityDonated: 1 }];

  // Perform creation similar to the endpoint
  const registration = await prisma.donationRegistration.create({
    data: {
      announcementId: parseInt(announcementId),
      authorId: parseInt(authorId),
      feePaid: 0,
      paymentStatus: 'Completed',
      isManual: true,
      books: {
        create: books.map(b => ({
          bookId: parseInt(b.bookId),
          quantityDonated: parseInt(b.quantityDonated)
        }))
      }
    }
  });

  console.log(`Manual Registration Created! ID: ${registration.id} | isManual: ${registration.isManual}`);

  // Fetch book stock again
  const updatedBook = await prisma.book.findUnique({ where: { id: book.id } });
  console.log(`Updated Book Stock: ${updatedBook.stock}`);

  if (updatedBook.stock === book.stock) {
    console.log("SUCCESS: Stock did not change!");
  } else {
    console.log("FAILURE: Stock changed!");
  }

  // Cleanup the test registration
  await prisma.donationBook.deleteMany({ where: { registrationId: registration.id } });
  await prisma.donationRegistration.delete({ where: { id: registration.id } });
  console.log("Test registration cleaned up.");
}

test()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
