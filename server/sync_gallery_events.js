const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncEvents() {
  console.log('Fetching all events...');
  const events = await prisma.event.findMany();
  
  for (const event of events) {
    try {
      await prisma.galleryEvent.upsert({
        where: { eventId: event.id },
        update: {
          location: event.location,
          date: new Date(event.date),
          duration: event.duration,
          type: event.eventType || 'Unknown',
          description: event.description || '',
          photoUrl: event.bannerUrl || ''
        },
        create: {
          eventId: event.id,
          location: event.location,
          place: 'Unknown',
          city: 'Unknown',
          date: new Date(event.date),
          duration: event.duration,
          authors: event.aggAuthors || 0,
          booksSold: event.aggSold || 0,
          type: event.eventType || 'Unknown',
          description: event.description || '',
          photoUrl: event.bannerUrl || ''
        }
      });
      console.log(`Synced GalleryEvent for Event ID: ${event.id}`);
    } catch (err) {
      console.error(`Failed to sync Event ID: ${event.id}`, err);
    }
  }
  
  console.log('Sync complete!');
  process.exit(0);
}

syncEvents();
