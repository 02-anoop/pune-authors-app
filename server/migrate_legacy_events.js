const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const pastEventsData = require('../src/app/components/data/past_events.json');

async function main() {
    for (const evt of pastEventsData) {
        const existing = await prisma.event.findFirst({ where: { name: evt.name, date: evt.date } });
        if (!existing) {
            await prisma.event.create({
                data: {
                    name: evt.name,
                    location: evt.address,
                    date: evt.date,
                    duration: evt.duration || "N/A",
                    status: "Legacy Archive",
                    eventType: "Book Fair",
                    aggAuthors: evt.authorsParticipated,
                    aggSold: evt.booksSold,
                    livePosEnabled: false
                }
            });
            console.log(`Created ${evt.name}`);
        }
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
