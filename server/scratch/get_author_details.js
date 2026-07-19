const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const author = await prisma.author.findFirst({
    where: { name: 'Amita Samant' }
  });
  console.log("Author:", author.name);
  console.log("Type of extraData:", typeof author.extraData);
  console.log("Keys of extraData:", Object.keys(author.extraData || {}).slice(0, 30));
  console.log("Values of extraData for those keys:", Object.keys(author.extraData || {}).slice(0, 30).map(k => author.extraData[k]));
}

main().finally(() => prisma.$disconnect());
