const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// Corrections based on the master table provided by user
// Format: [id, newFormat, newCategory, reason]
const corrections = [
  // Nyati Estaben → Housing Society (not Others)
  [52, 'Meet the Authors', 'Housing Society', 'Nyati Estaben is a housing society'],
  // HCL Technologies → Meet the Authors (not Stall), Corporate Office
  [55, 'Meet the Authors', 'Corporate Office', 'HCL is corporate office, format is Meet the Authors'],
  // TATA Motors (56) → Meet the Authors, Corporate Office
  [56, 'Meet the Authors', 'Corporate Office', 'TATA Motors main - Meet the Authors'],
  // Marvel Isola → Housing Society (not Others)
  [57, 'Meet the Authors', 'Housing Society', 'Marvel Isola is a housing society'],
  // Life Park → Housing Society (not Others) - row 22 in list
  [59, 'Meet the Authors', 'Housing Society', 'Life Park is a residential/housing society'],
  // Nyati Exotica → Housing Society (not Others)
  [60, 'Meet the Authors', 'Housing Society', 'Nyati Exotica is a housing society'],
  // TATA Motors PV (61) → Meet the Authors (not Stall), Corporate Office
  [61, 'Meet the Authors', 'Corporate Office', 'TATA Motors PV - Meet the Authors'],
  // TATA Motors Jaguar Land Rover (62) → Meet the Authors (not Stall)
  [62, 'Meet the Authors', 'Corporate Office', 'TATA JLR - Meet the Authors'],
  // TATA Chinchwad Plant (63) → Meet the Authors (not Stall)
  [63, 'Meet the Authors', 'Corporate Office', 'TATA Chinchwad - Meet the Authors'],
  // Kundan Peak → Housing Society (not Others) - row 27
  [64, 'Meet the Authors', 'Housing Society', 'Kundan Peak is a housing society'],
  // Persistent Systems (65 - trailing space) → Meet the Authors, Corporate Office (row 28)
  [65, 'Meet the Authors', 'Corporate Office', 'Persistent Systems - Meet the Authors'],
  // Persistent Systems (66) → Meet the Authors, Corporate Office (row 29)
  [66, 'Meet the Authors', 'Corporate Office', 'Persistent Systems - Meet the Authors'],
  // Tata Motors Kohinoor World Tower (68) → Meet the Authors (not Stall)
  [68, 'Meet the Authors', 'Corporate Office', 'Tata Kohinoor - Meet the Authors'],
  // Deloitte (69) → Meet the Authors, Corporate Office (not Others)
  [69, 'Meet the Authors', 'Corporate Office', 'Deloitte is Corporate Office'],
];

async function run() {
  console.log('Applying corrections...\n');
  for (const [id, format, category, reason] of corrections) {
    await p.event.update({ where: { id }, data: { eventType: format, category } });
    console.log(`  [${id}] ${format} | ${category} — ${reason}`);
  }
  console.log('\nAll corrections applied!');
  await p.$disconnect();
}

run().catch(e => { console.error(e); p.$disconnect(); });
