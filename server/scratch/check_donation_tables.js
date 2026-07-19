require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function check() {
  try {
    // Check DonationAnnouncement columns in actual DB
    const cols = await p.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'DonationAnnouncement' AND table_schema = 'public' ORDER BY column_name`;
    console.log('\n=== DonationAnnouncement columns in DB ===');
    cols.forEach(c => console.log(' -', c.column_name, ':', c.data_type));

    // Check DonationRegistration columns
    const regCols = await p.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'DonationRegistration' AND table_schema = 'public' ORDER BY column_name`;
    console.log('\n=== DonationRegistration columns in DB ===');
    regCols.forEach(c => console.log(' -', c.column_name, ':', c.data_type));

    // Try fetching announcements like the actual endpoint does
    console.log('\n=== Trying donationAnnouncement.findMany ===');
    const announcements = await p.donationAnnouncement.findMany({
      include: { library: true, registrations: true },
      orderBy: { createdAt: 'desc' }
    });
    console.log('Success! Count:', announcements.length);

  } catch(e) {
    console.error('\n=== ERROR ===');
    console.error('Message:', e.message);
    console.error('Code:', e.code);
    if (e.meta) console.error('Meta:', JSON.stringify(e.meta));
  } finally {
    await p.$disconnect();
  }
}

check();
