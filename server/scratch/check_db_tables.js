require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function check() {
  try {
    // Check what tables exist
    const tables = await p.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
    console.log('\n=== Tables in AWS DB ===');
    tables.forEach(t => console.log(' -', t.table_name));

    // Check columns in Author table
    const authorCols = await p.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'Author' AND table_schema = 'public' ORDER BY column_name`;
    console.log('\n=== Author table columns ===');
    authorCols.forEach(c => console.log(' -', c.column_name));

    // Check if DonationAnnouncement exists
    try {
      const count = await p.donationAnnouncement.count();
      console.log('\n=== DonationAnnouncement count:', count, '===');
    } catch(e) {
      console.log('\n=== DonationAnnouncement ERROR:', e.message, '===');
    }

    // Check if Library exists
    try {
      const libCount = await p.library.count();
      console.log('=== Library count:', libCount, '===');
    } catch(e) {
      console.log('=== Library ERROR:', e.message, '===');
    }

  } catch(e) {
    console.error('DB ERROR:', e.message);
  } finally {
    await p.$disconnect();
  }
}

check();
