const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Load
  const author = await prisma.author.findFirst({ where: { name: 'Amita Samant' } });
  console.log("BEFORE UPDATE - keys:", Object.keys(author.extraData || {}).slice(0, 10));
  
  let ed = author.extraData;
  const keys = Object.keys(ed);
  const numericKeys = keys.filter(k => /^\d+$/.test(k)).map(Number).sort((a, b) => a - b);
  
  let reconstructedStr = '';
  for (let i = 0; i < numericKeys.length; i++) {
    reconstructedStr += ed[String(i)];
  }
  
  const repairedObject = JSON.parse(reconstructedStr);
  
  // Re-merge non-numeric
  for (const key of keys) {
    if (!/^\d+$/.test(key)) {
      repairedObject[key] = ed[key];
    }
  }
  
  // Update
  const updated = await prisma.author.update({
    where: { id: author.id },
    data: { extraData: repairedObject }
  });
  
  console.log("AFTER UPDATE - returned keys:", Object.keys(updated.extraData || {}).slice(0, 10));
  
  // Fetch fresh
  const fresh = await prisma.author.findUnique({ where: { id: author.id } });
  console.log("FRESH FETCH - keys:", Object.keys(fresh.extraData || {}).slice(0, 10));
}

main().finally(() => prisma.$disconnect());
