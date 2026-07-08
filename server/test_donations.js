const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const announcements = await prisma.donationAnnouncement.findMany({
      include: { library: true, registrations: true },
      orderBy: { createdAt: 'desc' }
    });
    console.log("Success:", announcements);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
test();
