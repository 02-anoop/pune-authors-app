/**
 * Populates aggEligibleAuthors (verified eligible author count per event)
 * and corrects aggAuthors (actual participated) using the user-provided ground truth table.
 */
const prisma = require('./config/db');

// Ground truth: [eventId, eligibleAuthors, participatedAuthors, eventName (for logging)]
const corrections = [
  { id: 29,  eligible: 26, participated: 8,  name: 'Nyati Estate (26-Jan-2025)' },
  { id: 30,  eligible: 30, participated: 6,  name: 'Nyati Windchimes' },
  { id: 38,  eligible: 26, participated: 11, name: "Naval Officers' Residential Area" },
  { id: 39,  eligible: 30, participated: 24, name: 'Goa Book Fair' },
  { id: 40,  eligible: 30, participated: 8,  name: 'Thakur College of Engineering' },
  { id: 77,  eligible: 33, participated: 11, name: 'Clover Highlands (15-Mar-2026)' },
  { id: 32,  eligible: 33, participated: 8,  name: 'Kalpatru Estate' },
  { id: 31,  eligible: 33, participated: 10, name: 'Clover Highlands (23-Mar-2025)' },
  { id: 42,  eligible: 33, participated: 4,  name: 'Persistent Systems (24-Mar-2026)' },
  { id: 43,  eligible: 33, participated: 4,  name: 'Persistent Systems (25-Mar-2026)' },
  { id: 52,  eligible: 34, participated: 9,  name: 'Nyati Estaben' },
  { id: 50,  eligible: 34, participated: 32, name: 'Dehradun Book Fair' },
  { id: 33,  eligible: 34, participated: 6,  name: 'Salunke Vihar' },
  { id: 55,  eligible: 41, participated: 8,  name: 'HCL Technologies "Meet the Authors"' },
  { id: 56,  eligible: 41, participated: 8,  name: 'TATA Motors' },
  { id: 57,  eligible: 41, participated: 8,  name: 'Marvel Isola' },
  { id: 34,  eligible: 41, participated: 8,  name: 'AFMC' },
  { id: 58,  eligible: 42, participated: 6,  name: 'Nyati Estate (07-Jun-2026)' },
  { id: 59,  eligible: 43, participated: 6,  name: 'Life Park' },
  { id: 60,  eligible: 43, participated: 7,  name: 'Nyati Exotica' },
  { id: 61,  eligible: 43, participated: 8,  name: 'TATA Motors PV' },
  { id: 62,  eligible: 43, participated: 8,  name: 'TATA Motors Jaguar Land Rover' },
  { id: 63,  eligible: 43, participated: 8,  name: 'TATA Chinchwad Plant' },
  { id: 64,  eligible: 43, participated: 5,  name: 'Kundan Peak' },
  { id: 65,  eligible: 44, participated: 4,  name: 'Persistent Systems (23-Jun-2026)' },
  { id: 66,  eligible: 44, participated: 4,  name: 'Persistent Systems (24-Jun-2026)' },
  { id: 67,  eligible: 46, participated: 6,  name: 'Pristine Prolife Phase-1' },
  { id: 68,  eligible: 46, participated: 7,  name: 'Tata Motors Kohinoor World Tower' },
  { id: 71,  eligible: 46, participated: 11, name: 'Dempo College' },
  { id: 47,  eligible: 46, participated: 11, name: 'Goa University' },
  { id: 72,  eligible: 46, participated: 11, name: 'Naval War College' },
  { id: 49,  eligible: 46, participated: 11, name: 'Parvatibai Chowgule College' },
  { id: 54,  eligible: 46, participated: 31, name: 'Srinagar Book Fair' },
  // Jammu Book Fair — look up by name
  { id: null, eligible: 46, participated: 30, name: 'Jammu Book Fair', nameSearch: 'Jammu' },
  { id: 36,  eligible: 46, participated: 21, name: 'Pune Book Fair' },
  { id: 37,  eligible: 46, participated: 5,  name: 'Diwali Stall, Clover Highlands' },
];

async function main() {
  console.log('🔧 Populating aggEligibleAuthors + correcting aggAuthors...\n');

  for (const evt of corrections) {
    try {
      let id = evt.id;
      
      // Name-based lookup for events without a known ID
      if (!id && evt.nameSearch) {
        const found = await prisma.event.findFirst({
          where: { name: { contains: evt.nameSearch, mode: 'insensitive' } }
        });
        if (!found) {
          console.log(`⚠️  ${evt.name} — not found in DB, skipping`);
          continue;
        }
        id = found.id;
        console.log(`ℹ️  ${evt.name} found as ID ${id}`);
      }

      await prisma.event.update({
        where: { id },
        data: {
          aggEligibleAuthors: evt.eligible,
          aggAuthors: evt.participated
        }
      });

      const pct = Math.round((evt.participated / evt.eligible) * 100);
      console.log(`✅ ID ${id} – ${evt.name}: ${evt.participated}/${evt.eligible} = ${pct}%`);
    } catch (err) {
      console.error(`❌ Failed for ${evt.name}: ${err.message}`);
    }
  }

  console.log('\n✅ Done.');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
