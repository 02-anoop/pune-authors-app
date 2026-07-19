const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
  const orders = await prisma.order.findMany(); 
  console.log(orders.map(o => ({id: o.id, isBulk: o.isBulk}))); 
} 
main().catch(console.error).finally(() => prisma.$disconnect());
