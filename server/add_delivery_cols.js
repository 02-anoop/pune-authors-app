const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN "subtotal" DOUBLE PRECISION DEFAULT 0, ADD COLUMN "bundleDiscount" DOUBLE PRECISION DEFAULT 0, ADD COLUMN "deliveryCharges" DOUBLE PRECISION DEFAULT 0;`);
    console.log('Columns subtotal, bundleDiscount, deliveryCharges added successfully to Order table');
  } catch(err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
