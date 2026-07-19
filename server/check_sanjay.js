const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'sanjaylazar1@gmail.com';
  
  const user = await prisma.user.findUnique({ where: { email } });
  console.log("User Table:", user ? "Found" : "Not Found");
  
  const draft = await prisma.authorDraft.findUnique({ where: { email } });
  if (draft) {
    console.log("AuthorDraft Table: Found, step:", draft.step);
    if (draft.step === 2) {
      console.log("Draft Books:", JSON.stringify(draft.books, null, 2));
    }
  } else {
    console.log("AuthorDraft Table: Not Found");
  }
  
  const author = await prisma.author.findUnique({ where: { email } });
  console.log("Author Table:", author ? `Found, Status: ${author.status}` : "Not Found");
}

main().catch(console.error).finally(() => prisma.$disconnect());
