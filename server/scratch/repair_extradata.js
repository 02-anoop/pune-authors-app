const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const authors = await prisma.author.findMany();
  console.log(`Checking ${authors.length} authors...`);
  
  for (const author of authors) {
    let ed = author.extraData;
    if (!ed) continue;
    
    // If it's a string in the DB, parse it
    if (typeof ed === 'string') {
      try {
        ed = JSON.parse(ed);
      } catch (e) {
        continue;
      }
    }
    
    if (ed && typeof ed === 'object' && !Array.isArray(ed)) {
      // Check if it has numeric keys indicative of a split string
      const keys = Object.keys(ed);
      const numericKeys = keys.filter(k => /^\d+$/.test(k)).map(Number).sort((a, b) => a - b);
      
      // If it contains consecutive indices starting from 0, it's corrupted
      if (numericKeys.length > 0 && numericKeys[0] === 0 && numericKeys[numericKeys.length - 1] === numericKeys.length - 1) {
        console.log(`\nReconstructing extraData for author: ${author.name}`);
        
        let reconstructedStr = '';
        for (let i = 0; i < numericKeys.length; i++) {
          reconstructedStr += ed[String(i)];
        }
        
        try {
          let repairedObject = JSON.parse(reconstructedStr);
          
          // Re-merge other non-numeric keys from the corrupted extraData
          for (const key of keys) {
            if (!/^\d+$/.test(key)) {
              repairedObject[key] = ed[key];
            }
          }
          
          // Save the repaired object back to the database
          await prisma.author.update({
            where: { id: author.id },
            data: { extraData: repairedObject }
          });
          
          console.log(`Successfully repaired extraData for ${author.name}`);
        } catch (e) {
          console.error(`Failed to parse reconstructed string for ${author.name}:`, e.message);
        }
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
