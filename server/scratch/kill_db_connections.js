const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Attempting to terminate other database connections...");
    // Terminate all other database connections except this one
    const result = await prisma.$executeRawUnsafe(`
      SELECT pg_terminate_backend(pid) 
      FROM pg_stat_activity 
      WHERE datname = current_database() 
        AND pid <> pg_backend_pid();
    `);
    console.log("Database connections terminated successfully!", result);
  } catch (e) {
    console.error("Failed to terminate connections:", e);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
