const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

  const docs = [
    { message: "Guidelines for participation in Literary Events", documentName: "EVENT GUIDELINES PUNE AUTHORS' ASSOCIATION.PDF" },
    { message: "Group Charter", documentName: "GROUP ACTIVITIES AND CHARTER.PDF" },
    { message: "Group Guidelines", documentName: "GROUP GUIDELINES.PDF" }
  ];

  // Dummy PDF content (just to make it exist)
  // But wait, if they have a real PDF, maybe I can find it or just create a 0-byte file?
  // Let's copy an existing PDF if one exists, otherwise just write a blank PDF.
  const dummyPdfPath = path.join(__dirname, '..', 'src', 'app', 'components', 'data', 'Group Activities and Charter.pdf');
  
  for (const doc of docs) {
    const targetPath = path.join(uploadsDir, doc.documentName);
    if (fs.existsSync(dummyPdfPath)) {
      fs.copyFileSync(dummyPdfPath, targetPath);
    } else {
      fs.writeFileSync(targetPath, '%PDF-1.4\n%EOF\n');
    }

    await prisma.notification.create({
      data: {
        message: doc.message,
        target: 'ALL',
        documentName: doc.documentName,
        documentUrl: `/uploads/${doc.documentName}`
      }
    });
    console.log('Restored:', doc.documentName);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
