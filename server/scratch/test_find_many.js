const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const regs = await prisma.donationRegistration.findMany({
      take: 2,
      select: {
        id: true,
        isManual: true
      }
    });
    console.log("Found registrations:", regs);
  } catch (e) {
    console.error("findMany failed:", e);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
