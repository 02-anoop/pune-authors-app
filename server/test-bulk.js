const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const customer = await prisma.customer.findFirst();
    if (!customer) throw new Error("No customer found");
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        customerName: "Test",
        customerEmail: "test@test.com",
        customerPhone: "1234",
        address: "test address",
        amount: 100,
        status: "Bulk Request Pending",
        isBulk: true,
        items: {
          create: [{
            bookId: 143,
            quantity: 2
          }]
        }
      },
      include: { items: { include: { book: true } } }
    });
    console.log("Success:", order.id);
  } catch (err) {
    console.error("Bulk Order Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
test();
