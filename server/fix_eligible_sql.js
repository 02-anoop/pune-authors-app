/**
 * Uses raw SQL to set aggEligibleAuthors since the Prisma client
 * can't be regenerated while the server holds the DLL lock.
 */
const { Pool } = require('pg');
require('dotenv').config();

// Parse DATABASE_URL from env
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

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
  console.log('🔧 Using raw SQL to set aggEligibleAuthors...\n');

  // First find Jammu Book Fair ID
  const jammuRes = await pool.query(`SELECT id, name FROM "Event" WHERE LOWER(name) LIKE '%jammu%' LIMIT 1`);
  if (jammuRes.rows.length > 0) {
    const jammuId = jammuRes.rows[0].id;
    corrections.push({ id: jammuId, eligible: 46, participated: 30 });
    console.log(`ℹ️  Jammu Book Fair found: ID ${jammuId}`);
  } else {
    console.log(`⚠️  Jammu Book Fair not found in DB`);
  }

  for (const evt of corrections) {
    try {
      await pool.query(
        `UPDATE "Event" SET "aggEligibleAuthors" = $1, "aggAuthors" = $2 WHERE id = $3`,
        [evt.eligible, evt.participated, evt.id]
      );
      const pct = Math.round((evt.participated / evt.eligible) * 100);
      console.log(`✅ ID ${evt.id}: ${evt.participated}/${evt.eligible} = ${pct}%`);
    } catch (err) {
      console.error(`❌ ID ${evt.id} failed: ${err.message}`);
    }
  }

  await pool.end();
  console.log('\n✅ All done.');
}

main().catch(err => { console.error(err); process.exit(1); });
