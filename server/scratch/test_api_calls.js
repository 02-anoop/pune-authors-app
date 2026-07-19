require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function check() {
  try {
    // Simulate the exact call the route makes for GET /api/admin/donation-announcements
    console.log('\n=== Test 1: GET /api/admin/donation-announcements ===');
    const announcements = await p.donationAnnouncement.findMany({
      include: { library: true, registrations: true },
      orderBy: { createdAt: 'desc' }
    });
    console.log('SUCCESS - count:', announcements.length);
  } catch(e) {
    console.error('FAIL:', e.message.split('\n')[0]);
    if (e.meta) console.error('Meta:', e.meta);
  }

  try {
    // Simulate GET /api/admin/donation-registrations
    console.log('\n=== Test 2: GET /api/admin/donation-registrations ===');
    const registrations = await p.donationRegistration.findMany({
      include: {
        author: true,
        announcement: { include: { library: true } },
        books: { include: { book: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log('SUCCESS - count:', registrations.length);
  } catch(e) {
    console.error('FAIL:', e.message.split('\n')[0]);
    if (e.meta) console.error('Meta:', e.meta);
  }

  try {
    // Simulate GET /api/admin/donation-dashboard
    console.log('\n=== Test 3: GET /api/admin/donation-dashboard ===');
    const activeLibraries = await p.library.count({ where: { status: 'Active' } });
    const activeCampaigns = await p.donationAnnouncement.count({ where: { visibility: 'Published' } });
    const authors = await p.donationRegistration.findMany({ select: { authorId: true }, distinct: ['authorId'] });
    const books = await p.donationBook.aggregate({ _sum: { quantityDonated: true } });
    const pendingRegs = await p.donationRegistration.count({ where: { status: 'Registered' } });
    const pendingDispatches = await p.donationRegistration.count({ where: { status: 'Approved', dispatchStatus: 'Pending' } });
    const delivered = await p.donationRegistration.count({ where: { receivedStatus: 'Received' } });
    console.log('SUCCESS:', { activeLibraries, activeCampaigns, participatingAuthors: authors.length });
  } catch(e) {
    console.error('FAIL:', e.message.split('\n')[0]);
    if (e.meta) console.error('Meta:', e.meta);
  }

  try {
    // Test author.create with district (the last_error.log error)
    console.log('\n=== Test 4: author create with district field ===');
    // Find an existing author to see if all fields are accessible
    const author = await p.author.findFirst({ select: { id: true, district: true, dob: true, pincode: true, skillsJson: true } });
    console.log('SUCCESS - sample author fields:', author);
  } catch(e) {
    console.error('FAIL:', e.message.split('\n')[0]);
    if (e.meta) console.error('Meta:', e.meta);
  }

  await p.$disconnect();
}

check();
