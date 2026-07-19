const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const author = await prisma.author.findFirst({
    where: { name: 'Amita Samant' }
  });
  
  let ed = author.extraData;
  console.log("ed type:", typeof ed);
  
  const keys = Object.keys(ed);
  const numericKeys = keys.filter(k => /^\d+$/.test(k)).map(Number).sort((a, b) => a - b);
  
  let reconstructedStr = '';
  for (let i = 0; i < numericKeys.length; i++) {
    reconstructedStr += ed[String(i)];
  }
  
  console.log("reconstructedStr length:", reconstructedStr.length);
  console.log("reconstructedStr start:", reconstructedStr.slice(0, 100));
  
  try {
    let parsed = JSON.parse(reconstructedStr);
    console.log("parsed type:", typeof parsed);
    console.log("parsed keys:", Object.keys(parsed).slice(0, 10));
    
    if (typeof parsed === 'string') {
       let parsed2 = JSON.parse(parsed);
       console.log("parsed2 type:", typeof parsed2);
       console.log("parsed2 keys:", Object.keys(parsed2).slice(0, 10));
    }
  } catch(e) {
    console.log("Parse failed:", e.message);
  }
}

main().finally(() => prisma.$disconnect());
