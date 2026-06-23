const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting database cleanup...");

  // Delete all independent tables first (or those with Cascade)
  await prisma.contactInquiry.deleteMany({});
  console.log("Deleted ContactInquiries");

  await prisma.formResponse.deleteMany({});
  await prisma.formTemplate.deleteMany({});
  console.log("Deleted Form Data");

  await prisma.galleryImage.deleteMany({});
  await prisma.galleryEvent.deleteMany({});
  console.log("Deleted Gallery Data");

  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  console.log("Deleted Orders");

  await prisma.posOrderItem.deleteMany({});
  await prisma.posOrder.deleteMany({});
  console.log("Deleted PosOrders");

  await prisma.eventBook.deleteMany({});
  await prisma.eventAuthor.deleteMany({});
  await prisma.event.deleteMany({});
  console.log("Deleted Events");

  await prisma.eventRegistration.deleteMany({});
  await prisma.activity.deleteMany({});
  console.log("Deleted Activities");

  await prisma.bookReview.deleteMany({});
  await prisma.book.deleteMany({});
  console.log("Deleted Books");

  await prisma.query.deleteMany({});
  console.log("Deleted Queries");

  await prisma.author.deleteMany({});
  console.log("Deleted Authors");

  // Finally, delete all non-admin users
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      role: {
        not: 'ADMIN'
      }
    }
  });
  console.log(`Deleted ${deletedUsers.count} non-admin Users`);

  console.log("Database cleared successfully! Kept only the ADMIN user.");
}

main()
  .catch(e => {
    console.error("Error clearing database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
