const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// Derive format + category from event name + existing eventType
function deriveClassification(name, eventType) {
  const combined = ((name || '') + ' ' + (eventType || '')).toLowerCase();

  // BOOK FAIR check first (before generic "fair")
  if (combined.includes('book fair') || eventType === 'Book Fair') {
    return { format: 'Stall', category: 'Book Fair' };
  }
  if (combined.includes('fair') || combined.includes('mela')) {
    return { format: 'Stall', category: 'Fair' };
  }
  if (
    combined.includes('housing') || combined.includes('estate') ||
    combined.includes('vihar') || combined.includes('windchimes') ||
    combined.includes('highlands') || combined.includes('kalpatru') ||
    combined.includes('residential') || combined.includes('naval officer') ||
    combined.includes('prolife') || combined.includes('clover')
  ) {
    return { format: 'Meet the Authors', category: 'Housing Society' };
  }
  if (combined.includes('college') || combined.includes('afmc') || combined.includes('engineering')) {
    return { format: 'Meet the Authors', category: 'College' };
  }
  if (combined.includes('university') || combined.includes('iit') || combined.includes('institute')) {
    return { format: 'Meet the Authors', category: 'University' };
  }
  if (
    combined.includes('corporate') || combined.includes('tata') ||
    combined.includes('persistent') || combined.includes('hcl') ||
    combined.includes('systems') || combined.includes('motors')
  ) {
    return { format: 'Stall', category: 'Corporate Office' };
  }
  if (combined.includes('army') || combined.includes('military') || combined.includes('defence') || combined.includes('law')) {
    return { format: 'Meet the Authors', category: 'College' };
  }

  // Default fallback
  return { format: 'Meet the Authors', category: 'Others' };
}

async function run() {
  const events = await p.event.findMany({ where: { category: null }, select: { id: true, name: true, eventType: true } });
  console.log(`Found ${events.length} events with no category. Migrating...`);

  for (const evt of events) {
    const { format, category } = deriveClassification(evt.name, evt.eventType);
    await p.event.update({
      where: { id: evt.id },
      data: { eventType: format, category }
    });
    console.log(`  [${evt.id}] "${evt.name}" -> Format: ${format} | Category: ${category}`);
  }
  console.log('Migration complete.');
  await p.$disconnect();
}

run().catch(e => { console.error(e); p.$disconnect(); });
