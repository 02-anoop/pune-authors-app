const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const authors = await prisma.author.findMany();
  const allSystemEvents = await prisma.event.findMany({
    where: { status: { notIn: ['Cancelled', 'Draft'] } }
  });

  const mismatchedAuthors = [];

  for (const author of authors) {
    const eventInvites = await prisma.eventAuthor.findMany({
      where: { authorId: author.id },
      include: {
        event: {
          include: {
            eventBooks: { where: { authorId: author.id }, include: { book: true } }
          }
        }
      }
    });

    const listedBooks = await prisma.eventBook.findMany({
      where: { authorId: author.id }
    });

    const pastEvents = await prisma.event.findMany({
      where: { 
        status: { in: ['Past', 'Legacy Archive'] }
      },
      include: {
        eventBooks: { where: { authorId: author.id }, include: { book: true } }
      }
    });

    // Compute backend participatedCount
    let participatedCount = 0;
    if (eventInvites) {
      participatedCount += eventInvites.filter(ei => ei.optInStatus === 'Registered' || ei.optInStatus === 'Approved' || ei.optInStatus === 'Pending Approval').length;
    }

    // Now compute frontend validParticipations.length
    const invites = eventInvites;
    
    let filteredEvents = [
      ...invites.map((inv) => {
        const hasGranular = listedBooks.filter(lb => lb.eventId === (inv.eventId || inv.event?.id)).some(lb => lb.soldStock > 0 || lb.returnedStock > 0);
        return {
          ...inv.event,
          registration: inv.optInStatus,
          isPast: inv.event?.status === 'Past' || inv.event?.status === 'Legacy Archive' || (inv.event?.date && new Date(inv.event.date) < new Date()),
          isInvite: true,
          isDataUpdated: inv.manualTotalSold !== null || hasGranular || inv.event?.broadcastStatus === 'Published'
        };
      }),
      ...pastEvents.filter(pe => pe.broadcastStatus === 'Published' && !invites.some(inv => inv.eventId === pe.id)).map(evt => ({
        ...evt,
        registration: 'Not Participated',
        isPast: true,
        isInvite: false,
        isDataUpdated: true
      }))
    ].filter(evt => {
       if (evt.status === 'Legacy Archive' && evt.broadcastStatus !== 'Published') {
           return false;
       }
       return true;
    });

    const getEventBooks = (eventId) => listedBooks.filter(lb => lb.eventId === eventId);
    const getPastEventBooks = (eventId) => {
      const pe = pastEvents.find(p => p.id === eventId);
      return pe?.eventBooks || [];
    };

    const validParticipations = filteredEvents.filter((evt) => {
      if (evt.registration === 'Registered' || evt.registration === 'Approved' || evt.registration === 'Pending Approval') return true;
      if (evt.status === 'Legacy Archive') return false;
      if (evt.isPast) {
        // Here we simulate the frontend logic: evt.isDataUpdated && length > 0 OR we just fixed it for global override
        // Wait, the frontend code we JUST changed: 
        // if (evt.isDataUpdated && (evt.isInvite ? getEventBooks(evt.id).length > 0 : getPastEventBooks(evt.id).length > 0)) return true;
        // Actually, did we change validParticipations? NO! We only changed the rendering in the modal.
        // So validParticipations remains the same.
        if (evt.isDataUpdated && (evt.isInvite ? getEventBooks(evt.id).length > 0 : getPastEventBooks(evt.id).length > 0)) return true;
      }
      return false;
    });

    if (participatedCount !== validParticipations.length) {
      mismatchedAuthors.push(author.name);
    }
  }

  console.log("Mismatched Authors:", mismatchedAuthors);
}

check().catch(console.error).finally(() => prisma.$disconnect());
