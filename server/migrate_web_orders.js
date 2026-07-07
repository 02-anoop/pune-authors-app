require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Applying schema alterations to OrderItem...");
  
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "OrderItem" ADD COLUMN "expectedDeliveryDate" TIMESTAMP(3)`);
    console.log("Added expectedDeliveryDate");
  } catch (e) { console.log("expectedDeliveryDate may already exist", e.message); }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "OrderItem" ADD COLUMN "lateDeliveryReportedAt" TIMESTAMP(3)`);
    console.log("Added lateDeliveryReportedAt");
  } catch (e) { console.log("lateDeliveryReportedAt may already exist", e.message); }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "OrderItem" ADD COLUMN "isLateDeliveryReported" BOOLEAN NOT NULL DEFAULT false`);
    console.log("Added isLateDeliveryReported");
  } catch (e) { console.log("isLateDeliveryReported may already exist", e.message); }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "OrderItem" ADD COLUMN "autoDelivered" BOOLEAN NOT NULL DEFAULT false`);
    console.log("Added autoDelivered");
  } catch (e) { console.log("autoDelivered may already exist", e.message); }

  console.log("Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
