require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function diagnose() {
  console.log('\n======= FULL DIAGNOSIS =======\n');

  // 1. Check DB connection
  try {
    await p.$queryRaw`SELECT 1`;
    console.log('✅ DB Connection: OK');
  } catch(e) {
    console.log('❌ DB Connection: FAILED -', e.message);
    await p.$disconnect();
    return;
  }

  // 2. Check all tables exist
  const tables = await p.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
  const tableNames = tables.map(t => t.table_name);
  const requiredTables = ['Author','Book','DonationAnnouncement','DonationBook','DonationLog','DonationRegistration','Library','Event','EventAuthor','EventBook','PosOrder','PosOrderItem'];
  const missingTables = requiredTables.filter(t => !tableNames.includes(t));
  if (missingTables.length === 0) {
    console.log('✅ All required tables: PRESENT');
  } else {
    console.log('❌ Missing tables:', missingTables);
  }

  // 3. Simulate exact donation-announcements route
  try {
    const r = await p.donationAnnouncement.findMany({ include: { library: true, registrations: true }, orderBy: { createdAt: 'desc' } });
    console.log('✅ GET /api/admin/donation-announcements: OK (count:', r.length, ')');
  } catch(e) {
    console.log('❌ GET /api/admin/donation-announcements: FAILED');
    console.log('   Error:', e.message.split('\n')[0]);
    if (e.meta) console.log('   Meta:', e.meta);
  }

  // 4. Simulate exact donation-registrations route (all registrations)
  try {
    const r = await p.donationRegistration.findMany({
      include: { author: true, announcement: { include: { library: true } }, books: { include: { book: true } } },
      orderBy: { createdAt: 'desc' }
    });
    console.log('✅ GET /api/admin/donation-registrations: OK (count:', r.length, ')');
  } catch(e) {
    console.log('❌ GET /api/admin/donation-registrations: FAILED');
    console.log('   Error:', e.message.split('\n')[0]);
    if (e.meta) console.log('   Meta:', e.meta);
  }

  // 5. Simulate donation-dashboard route
  try {
    const activeLibraries = await p.library.count({ where: { status: 'Active' } });
    const activeCampaigns = await p.donationAnnouncement.count({ where: { visibility: 'Published' } });
    const authors = await p.donationRegistration.findMany({ select: { authorId: true }, distinct: ['authorId'] });
    const books = await p.donationBook.aggregate({ _sum: { quantityDonated: true } });
    console.log('✅ GET /api/admin/donation-dashboard: OK', { activeLibraries, activeCampaigns });
  } catch(e) {
    console.log('❌ GET /api/admin/donation-dashboard: FAILED');
    console.log('   Error:', e.message.split('\n')[0]);
    if (e.meta) console.log('   Meta:', e.meta);
  }

  // 6. Simulate GET /api/admin/libraries
  try {
    const r = await p.library.findMany({ orderBy: { createdAt: 'desc' } });
    console.log('✅ GET /api/admin/libraries: OK (count:', r.length, ')');
    console.log('   Sample:', r.slice(0,2).map(l => l.name));
  } catch(e) {
    console.log('❌ GET /api/admin/libraries: FAILED');
    console.log('   Error:', e.message.split('\n')[0]);
  }

  // 7. Check for any schema drift - columns that exist in schema.prisma but NOT in DB
  console.log('\n--- Column Drift Check ---');
  
  // DonationAnnouncement
  const daCols = await p.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'DonationAnnouncement' AND table_schema = 'public'`;
  const daNames = daCols.map(c => c.column_name);
  // These are ALL fields from schema.prisma
  const schemaDA = ['id','title','description','libraryId','eventDate','announcementDate','registrationStartDate','registrationEndDate','expectedCollectionDate','expectedDispatchDate','collectionPoint','dispatchAddress','contactPerson','contactNumber','feeType','feeAmount','additionalInstructions','visibility','createdAt'];
  const missingDA = schemaDA.filter(f => !daNames.includes(f));
  if (missingDA.length) console.log('❌ DonationAnnouncement missing:', missingDA);
  else console.log('✅ DonationAnnouncement: all columns match');

  // Library
  const libCols = await p.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'Library' AND table_schema = 'public'`;
  const libNames = libCols.map(c => c.column_name);
  const schemaLib = ['id','name','type','airportCode','airportName','city','state','country','contactPerson','contactNumber','email','shippingAddress','status','createdAt'];
  const missingLib = schemaLib.filter(f => !libNames.includes(f));
  if (missingLib.length) console.log('❌ Library missing:', missingLib);
  else console.log('✅ Library: all columns match');

  // DonationRegistration
  const drCols = await p.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'DonationRegistration' AND table_schema = 'public'`;
  const drNames = drCols.map(c => c.column_name);
  const schemaDR = ['id','announcementId','authorId','status','verificationStatus','dispatchStatus','receivedStatus','feePaid','paymentStatus','paymentScreenshot','transactionId','dispatchDate','courierPartner','trackingNumber','collectionPoint','packedBy','receivedDate','receivedBy','libraryConfirmation','proofImageUrl','remarks','useGlobalOverride','globalBooksDonated','globalDonationValue','globalRemarks','broadcastStatus','createdAt'];
  const missingDR = schemaDR.filter(f => !drNames.includes(f));
  if (missingDR.length) console.log('❌ DonationRegistration missing:', missingDR);
  else console.log('✅ DonationRegistration: all columns match');

  // DonationBook
  const dbCols = await p.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'DonationBook' AND table_schema = 'public'`;
  const dbNames = dbCols.map(c => c.column_name);
  const schemaDB = ['id','registrationId','bookId','quantityDonated','qtyCollected','qtyDispatched','qtyReceived','libraryConfirmation','remarks','createdAt'];
  const missingDB = schemaDB.filter(f => !dbNames.includes(f));
  if (missingDB.length) console.log('❌ DonationBook missing:', missingDB);
  else console.log('✅ DonationBook: all columns match');

  // Author - check key columns
  const authCols = await p.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'Author' AND table_schema = 'public'`;
  const authNames = authCols.map(c => c.column_name);
  const schemaAuth = ['id','name','email','phone','bio','photoUrl','status','createdAt','whatsapp','rejectionReason','paymentScreenshot','transactionId','extraData','qrCodeUrl','city','facebook','instagram','penName','state','aadharNumber','address','qualification','age','experience','hobbies','skills','whyJoining','certificateUrl','district','dob','hobbiesJson','institution','pincode','qualificationsJson','skillsJson','subject'];
  const missingAuth = schemaAuth.filter(f => !authNames.includes(f));
  if (missingAuth.length) console.log('❌ Author missing:', missingAuth);
  else console.log('✅ Author: all columns match');

  // 8. Check JWT_SECRET env
  console.log('\n--- Environment Check ---');
  console.log('JWT_SECRET set:', !!process.env.JWT_SECRET, '| Value:', process.env.JWT_SECRET === 'your_secret_key' ? '⚠️  STILL DEFAULT (your_secret_key)' : '✅ Custom value');
  console.log('PORT:', process.env.PORT || '3001 (default)');
  console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);

  await p.$disconnect();
  console.log('\n======= END DIAGNOSIS =======\n');
}

diagnose();
