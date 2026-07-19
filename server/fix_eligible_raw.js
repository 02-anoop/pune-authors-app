/**
 * Uses Prisma.$queryRawUnsafe to set aggEligibleAuthors
 * (workaround for locked Prisma DLL preventing client regen)
 */
const prisma = require('./config/db');

const corrections = [
  { id: 29,  eligible: 26, participated: 8  },
  { id: 30,  eligible: 30, participated: 6  },
  { id: 38,  eligible: 26, participated: 11 },
  { id: 39,  eligible: 30, participated: 24 },
  { id: 40,  eligible: 30, participated: 8  },
  { id: 77,  eligible: 33, participated: 11 },
  { id: 32,  eligible: 33, participated: 8  },
  { id: 31,  eligible: 33, participated: 10 },
  { id: 42,  eligible: 33, participated: 4  },
  { id: 43,  eligible: 33, participated: 4  },
  { id: 52,  eligible: 34, participated: 9  },
  { id: 50,  eligible: 34, participated: 32 },
  { id: 33,  eligible: 34, participated: 6  },
  { id: 55,  eligible: 41, participated: 8  },
  { id: 56,  eligible: 41, participated: 8  },
  { id: 57,  eligible: 41, participated: 8  },
  { id: 34,  eligible: 41, participated: 8  },
  { id: 58,  eligible: 42, participated: 6  },
  { id: 59,  eligible: 43, participated: 6  },
  { id: 60,  eligible: 43, participated: 7  },
  { id: 61,  eligible: 43, participated: 8  },
  { id: 62,  eligible: 43, participated: 8  },
  { id: 63,  eligible: 43, participated: 8  },
  { id: 64,  eligible: 43, participated: 5  },
  { id: 65,  eligible: 44, participated: 4  },
  { id: 66,  eligible: 44, participated: 4  },
  { id: 67,  eligible: 46, participated: 6  },
  { id: 68,  eligible: 46, participated: 7  },
  { id: 71,  eligible: 46, participated: 11 },
  { id: 47,  eligible: 46, participated: 11 },
  { id: 72,  eligible: 46, participated: 11 },
  { id: 49,  eligible: 46, participated: 11 },
  { id: 54,  eligible: 46, participated: 31 },
  { id: 36,  eligible: 46, participated: 21 },
  { id: 37,  eligible: 46, participated: 5  },
];

async function main() {
  console.log('🔧 Setting aggEligibleAuthors via raw SQL...\n');

  // Find Jammu Book Fair
  const jammu = await prisma.$queryRawUnsafe(`SELECT id FROM "Event" WHERE LOWER(name) LIKE '%jammu%' LIMIT 1`);
  if (jammu.length > 0) {
    corrections.push({ id: jammu[0].id, eligible: 46, participated: 30 });
    console.log(`ℹ️  Jammu Book Fair = ID ${jammu[0].id}`);
  } else {
    console.log(`⚠️  Jammu Book Fair not found in DB`);
  }

  for (const evt of corrections) {
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE "Event" SET "aggEligibleAuthors" = ${evt.eligible}, "aggAuthors" = ${evt.participated} WHERE id = ${evt.id}`
      );
      const pct = Math.round((evt.participated / evt.eligible) * 100);
      console.log(`✅ ID ${evt.id}: ${evt.participated}/${evt.eligible} = ${pct}%`);
    } catch (err) {
      console.error(`❌ ID ${evt.id} failed: ${err.message}`);
    }
  }

  console.log('\n✅ All done.');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
