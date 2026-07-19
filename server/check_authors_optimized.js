const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const authors = await prisma.author.findMany();
  
  const allEventAuthors = await prisma.eventAuthor.findMany({
    include: {
      event: true
    }
  });

  const allEventBooks = await prisma.eventBook.findMany({
    include: { book: true }
  });

  const pastEvents = await prisma.event.findMany({
    where: { 
      status: { in: ['Past', 'Legacy Archive'] }
    },
    include: {
      eventBooks: true
    }
  });

  const mismatchedAuthors = [];

  for (const author of authors) {
    const eventInvites = allEventAuthors.filter(ea => ea.authorId === author.id);
    const listedBooks = allEventBooks.filter(eb => eb.authorId === author.id);

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
      return (pe?.eventBooks || []).filter(eb => eb.authorId === author.id);
    };

    const validParticipations = filteredEvents.filter((evt) => {
      if (evt.registration === 'Registered' || evt.registration === 'Approved' || evt.registration === 'Pending Approval') return true;
      if (evt.status === 'Legacy Archive') return false;
      if (evt.isPast) {
        if (evt.isDataUpdated && (evt.isInvite ? getEventBooks(evt.id).length > 0 : getPastEventBooks(evt.id).length > 0)) return true;
      }
      return false;
    });

    if (participatedCount !== validParticipations.length) {
      mismatchedAuthors.push(author.name);
    }
  }

  console.log("Mismatched Authors:");
  mismatchedAuthors.forEach(a => console.log("- " + a));
}

check().catch(console.error).finally(() => prisma.$disconnect());
