const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findMany({ select: { id: true, email: true, role: true } })
  .then(users => {
    console.log("USERS IN DB:", users);
  })
  .catch(console.error)
  .finally(() => prisma.$disconnect());
