const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

async function test() {
  try {
    // No admin token needed for direct prisma test
    
    // Fake the /api/admin/authors logic exactly
    const authors = await prisma.author.findMany({
      include: { books: { include: { reviews: true } }, eventRegistrations: true, eventAuthors: true }
    });
    
    const mapped = authors.map(a => ({
      ...a,
      joined: a.createdAt.toISOString().split('T')[0],
      totalBooks: a.books.length,
      eventsPart: a.eventRegistrations.length + a.eventAuthors.length
    }));
    
    const baani = mapped.find(a => a.name.includes('Baani') || a.id === 123);
    console.log('API output for Baani:', baani.extraData);

    const pendingFineApprovals = mapped.filter((a) =>
      (a.extraData?.fineStatus === 'Pending Verification' || (!a.extraData?.fineStatus && a.extraData?.finePaymentScreenshot))
      && a.extraData?.finePaymentScreenshot
    );
    console.log('Pending Approvals length:', pendingFineApprovals.length);
    if (pendingFineApprovals.length > 0) {
      console.log('Pending Approvals names:', pendingFineApprovals.map(a => a.name));
    }

    const activeFines = mapped.filter((a) => a.extraData?.lateFines > 0 && a.extraData?.fineStatus !== 'Pending Verification');
    console.log('Active Fines names:', activeFines.map(a => a.name));

    const historyAuthors = mapped.filter((a) => a.extraData?.fineHistory && a.extraData.fineHistory.length > 0);
    console.log('History Authors length:', historyAuthors.length);
    if (historyAuthors.length > 0) {
    // lateDeliveriesMap logic from OperationsDashboardPage.tsx
    const lateDeliveriesMap = {};
    const adminBooksRes = await prisma.book.findMany({ include: { orders: true, author: true } });
    
    adminBooksRes.forEach(b => {
      b.orders?.forEach(o => {
        let it = o;
        if (it.status === 'Pending' || it.status === 'Accepted' || it.status === 'Pending Verification') {
          let ignoreForLate = false;
          if (b.author?.extraData) {
            let authorExtra = b.author.extraData;
            if (typeof authorExtra === 'string') authorExtra = JSON.parse(authorExtra);
            if (authorExtra.lastFinePaidAt) {
              if (new Date(it.createdAt).getTime() < new Date(authorExtra.lastFinePaidAt).getTime()) {
                ignoreForLate = true;
              }
            }
            if (!ignoreForLate && authorExtra.fineStatus !== 'Pending Verification' && (!authorExtra.fineDate || (new Date().getTime() - new Date(authorExtra.fineDate).getTime()) / (1000 * 3600) > 24)) {
              const hours = (new Date().getTime() - new Date(it.createdAt).getTime()) / (1000 * 3600);
              if (hours > 24 && it.authorId) {
                if (!lateDeliveriesMap[it.authorId]) {
                  lateDeliveriesMap[it.authorId] = { authorName: b.author.name, orderId: o.id, hours: Math.round(hours), count: 0, orderDates: [] };
                }
                lateDeliveriesMap[it.authorId].count++;
                lateDeliveriesMap[it.authorId].orderDates.push(it.createdAt);
                if (Math.round(hours) > lateDeliveriesMap[it.authorId].hours) {
                  lateDeliveriesMap[it.authorId].hours = Math.round(hours);
                }
              }
            }
          }
        }
      });
    });

    const lateDeliveries = Object.entries(lateDeliveriesMap).map(([authorId, data]) => ({ authorId: Number(authorId), ...data }));
    console.log('--- LATE DELIVERIES DATA ---');
    console.log(JSON.stringify(lateDeliveries, null, 2));

    const baani = await prisma.author.findFirst({ where: { name: 'Baani Garg' }});
    if (baani) {
       console.log('Baani lastFinePaidAt:', baani.extraData.lastFinePaidAt);
    }

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
