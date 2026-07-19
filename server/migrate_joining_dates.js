const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateAuthors() {
  const file1 = path.join(__dirname, '..', 'src', 'app', 'data', 'Event_Summary.xlsx');
  const file2 = path.join(__dirname, '..', 'src', 'app', 'data', 'author_events.xlsx');

  const wb1 = xlsx.readFile(file1);
  const eventsData = xlsx.utils.sheet_to_json(wb1.Sheets[wb1.SheetNames[0]]);
  
  const wb2 = xlsx.readFile(file2);
  const authorsData = xlsx.utils.sheet_to_json(wb2.Sheets[wb2.SheetNames[0]]);

  const totalEvents = eventsData.length;

  let matched = 0;
  let notFound = [];

  for (const row of authorsData) {
    const authorName = row['Author Name'] ? row['Author Name'].trim() : null;
    const phone = row['Phone No'] ? String(row['Phone No']).trim() : null;
    const eventsAfter = parseInt(row['No. of Events Happened After Joining']) || 0;
    
    if (!authorName && !phone) continue;

    // Determine joining date based on total events
    // If eventsAfter == 36, index is 0. If eventsAfter == 1, index is 35.
    const eventIndex = totalEvents - eventsAfter;
    let joiningDate = new Date();
    if (eventIndex >= 0 && eventIndex < totalEvents) {
      const dateStr = eventsData[eventIndex]['Event Date']; // e.g. "26-Jan-2026"
      joiningDate = new Date(dateStr);
    } else if (eventIndex < 0) {
      joiningDate = new Date('2025-01-01'); // Long ago
    }

    // Try finding in DB
    let authors = [];
    if (phone) {
      // phone matching can be tricky with spaces or prefixes
      const sanitizedPhone = phone.replace(/\D/g, '').slice(-10);
      authors = await prisma.author.findMany({
        where: {
          phone: { contains: sanitizedPhone }
        }
      });
    }

    if (authors.length === 0 && authorName) {
      authors = await prisma.author.findMany({
        where: {
          name: { contains: authorName, mode: 'insensitive' }
        }
      });
    }

    if (authors.length > 0) {
      // Update first match
      await prisma.author.update({
        where: { id: authors[0].id },
        data: { groupJoiningDate: joiningDate }
      });
      matched++;
    } else {
      notFound.push(authorName || phone);
    }
  }

  console.log(`Matched and updated: ${matched}`);
  console.log(`Not found in DB: ${notFound.length}`);
  if (notFound.length > 0) console.log(notFound.slice(0, 10));

  await prisma.$disconnect();
}

migrateAuthors().catch(console.error);
