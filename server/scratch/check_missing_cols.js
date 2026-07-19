require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function check() {
  try {
    // Check what columns are MISSING from DonationRegistration in the DB vs schema
    // Schema has: feePaid (Int), but DB column name might differ
    
    // Check Author table - is district there?
    const authorCols = await p.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'Author' AND table_schema = 'public'`;
    const authorColNames = authorCols.map(c => c.column_name);
    
    const schemaAuthorCols = ['id','name','email','phone','bio','photoUrl','status','createdAt','whatsapp','rejectionReason','paymentScreenshot','transactionId','extraData','qrCodeUrl','city','facebook','instagram','penName','state','aadharNumber','address','qualification','age','experience','hobbies','skills','whyJoining','certificateUrl','district','dob','hobbiesJson','institution','pincode','qualificationsJson','skillsJson','subject'];
    
    const missingAuthorCols = schemaAuthorCols.filter(c => !authorColNames.includes(c));
    console.log('\n=== Missing Author columns in DB ===');
    if (missingAuthorCols.length === 0) console.log('None! All present.');
    else missingAuthorCols.forEach(c => console.log(' MISSING:', c));

    // Check DonationAnnouncement missing cols
    const daCols = await p.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'DonationAnnouncement' AND table_schema = 'public'`;
    const daColNames = daCols.map(c => c.column_name);
    const schemaDACols = ['id','title','description','libraryId','eventDate','announcementDate','registrationStartDate','registrationEndDate','expectedCollectionDate','expectedDispatchDate','collectionPoint','dispatchAddress','contactPerson','contactNumber','feeType','feeAmount','additionalInstructions','visibility','createdAt'];
    const missingDACols = schemaDACols.filter(c => !daColNames.includes(c));
    console.log('\n=== Missing DonationAnnouncement columns in DB ===');
    if (missingDACols.length === 0) console.log('None! All present.');
    else missingDACols.forEach(c => console.log(' MISSING:', c));

    // Check DonationRegistration missing cols  
    const drCols = await p.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'DonationRegistration' AND table_schema = 'public'`;
    const drColNames = drCols.map(c => c.column_name);
    const schemaDRCols = ['id','announcementId','authorId','status','verificationStatus','dispatchStatus','receivedStatus','feePaid','paymentStatus','paymentScreenshot','transactionId','dispatchDate','courierPartner','trackingNumber','collectionPoint','packedBy','receivedDate','receivedBy','libraryConfirmation','proofImageUrl','remarks','useGlobalOverride','globalBooksDonated','globalDonationValue','globalRemarks','broadcastStatus','createdAt'];
    const missingDRCols = schemaDRCols.filter(c => !drColNames.includes(c));
    console.log('\n=== Missing DonationRegistration columns in DB ===');
    if (missingDRCols.length === 0) console.log('None! All present.');
    else missingDRCols.forEach(c => console.log(' MISSING:', c));

    // Now try author create (the actual failing operation from last_error.log)
    console.log('\n=== Testing prisma.author with district field ===');
    try {
      // Don't actually create, just validate by checking if the field is accepted
      await p.author.findFirst({ where: { district: 'test' } });
      console.log('district field: WORKS in query');
    } catch(e2) {
      console.log('district field ERROR:', e2.message.split('\n')[0]);
    }

  } catch(e) {
    console.error('ERROR:', e.message);
  } finally {
    await p.$disconnect();
  }
}

check();
