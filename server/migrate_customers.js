const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({ where: { customerId: null } });
  let count = 0;
  for (const order of orders) {
    if (!order.customerEmail) continue;
    let customer = await prisma.customer.findUnique({ where: { email: order.customerEmail } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: order.customerName || 'Guest',
          email: order.customerEmail,
          phone: order.customerPhone || null
        }
      });
    }
    await prisma.order.update({
      where: { id: order.id },
      data: { customerId: customer.id }
    });
    count++;
  }
  console.log(`Migrated ${count} orders to customers.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
