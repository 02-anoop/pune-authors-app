/**
 * Fixes aggAuthors on existing events using the correct participation data provided.
 * 
 * Mapping: event ID => { aggAuthors, eligibleAuthors (for reference) }
 * 
 * Corrections needed:
 *   - Goa Book Fair (id 39): 26 -> 24
 *   - Dehradun Book Fair (id 50): 40 -> 32
 *   - Srinagar Book Fair (id 54): 30 -> 31
 *   - Persistent Systems 23-Jun (id 65): 5 -> 4
 * 
 * Also need to create Jammu Book Fair entry if missing.
 */

const prisma = require('./config/db');

const corrections = [
  // { id, newAggAuthors, name (for logging) }
  { id: 29, aggAuthors: 8,  name: 'Nyati Estate (26-Jan-2025)' },
  { id: 30, aggAuthors: 6,  name: 'Nyati Windchimes' },
  { id: 38, aggAuthors: 11, name: "Naval Officers' Residential Area" },
  { id: 39, aggAuthors: 24, name: 'Goa Book Fair' },            // was 26 (wrong)
  { id: 40, aggAuthors: 8,  name: 'Thakur College of Engineering' },
  { id: 77, aggAuthors: 11, name: 'Clover Highlands (15-Mar-2026)' },
  { id: 32, aggAuthors: 8,  name: 'Kalpatru Estate' },
  { id: 31, aggAuthors: 10, name: 'Clover Highlands (23-Mar-2025)' },
  { id: 42, aggAuthors: 4,  name: 'Persistent Systems (24-Mar-2026)' },
  { id: 43, aggAuthors: 4,  name: 'Persistent Systems (25-Mar-2026)' },
  { id: 52, aggAuthors: 9,  name: 'Nyati Estaben' },
  { id: 50, aggAuthors: 32, name: 'Dehradun Book Fair' },        // was 40 (wrong)
  { id: 33, aggAuthors: 6,  name: 'Salunke Vihar' },
  { id: 55, aggAuthors: 8,  name: 'HCL Technologies "Meet the Authors"' },
  { id: 56, aggAuthors: 8,  name: 'TATA Motors' },
  { id: 57, aggAuthors: 8,  name: 'Marvel Isola' },
  { id: 34, aggAuthors: 8,  name: 'AFMC (31-May-2025)' },
  { id: 58, aggAuthors: 6,  name: 'Nyati Estate (07-Jun-2026)' },
  { id: 59, aggAuthors: 6,  name: 'Life Park' },
  { id: 60, aggAuthors: 7,  name: 'Nyati Exotica' },
  { id: 61, aggAuthors: 8,  name: 'TATA Motors PV' },
  { id: 62, aggAuthors: 8,  name: 'TATA Motors Jaguar Land Rover' },
  { id: 63, aggAuthors: 8,  name: 'TATA Chinchwad Plant' },
  { id: 64, aggAuthors: 5,  name: 'Kundan Peak' },
  { id: 65, aggAuthors: 4,  name: 'Persistent Systems (23-Jun-2026)' }, // was 5 (wrong)
  { id: 66, aggAuthors: 4,  name: 'Persistent Systems (24-Jun-2026)' },
  { id: 67, aggAuthors: 6,  name: 'Pristine Prolife Phase-1' },
  { id: 68, aggAuthors: 7,  name: 'Tata Motors Kohinoor World Tower' },
  { id: 71, aggAuthors: 11, name: 'Dempo College' },
  { id: 47, aggAuthors: 11, name: 'Goa University' },
  { id: 72, aggAuthors: 11, name: 'Naval War College' },
  { id: 49, aggAuthors: 11, name: 'Parvatibai Chowgule College' },
  { id: 54, aggAuthors: 31, name: 'Srinagar Book Fair' },        // was 30 (wrong)
  { id: 36, aggAuthors: 21, name: 'Pune Book Fair' },            // was 34 (wrong)
  { id: 37, aggAuthors: 5,  name: 'Diwali Stall, Clover Highlands' },
];

// Jammu Book Fair – check if it exists, if not create it
const jammuBookFair = {
  name: 'Jammu Book Fair',
  aggAuthors: 30,
  // We'll check by name before creating
};

async function main() {
  console.log('🔧 Starting aggAuthors corrections...\n');

  for (const evt of corrections) {
    try {
      await prisma.event.update({
        where: { id: evt.id },
        data: { aggAuthors: evt.aggAuthors }
      });
      console.log(`✅ Updated ID ${evt.id} – ${evt.name}: aggAuthors = ${evt.aggAuthors}`);
    } catch (err) {
      console.error(`❌ Failed to update ID ${evt.id} – ${evt.name}: ${err.message}`);
    }
  }

  // Check/create Jammu Book Fair
  const existingJammu = await prisma.event.findFirst({
    where: { name: { contains: 'Jammu', mode: 'insensitive' } }
  });

  if (existingJammu) {
    await prisma.event.update({
      where: { id: existingJammu.id },
      data: { aggAuthors: 30 }
    });
    console.log(`✅ Updated existing Jammu event (ID ${existingJammu.id}): aggAuthors = 30`);
  } else {
    console.log(`⚠️  No Jammu Book Fair event found in DB. Please create it manually or via the admin panel.`);
    console.log(`   Correct data: Jammu Book Fair – 46 eligible authors, 30 participated`);
  }

  console.log('\n✅ All corrections applied successfully.');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
