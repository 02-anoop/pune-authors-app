const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const libraries = [
    {
      name: 'Pune Airport',
      type: 'Domestic',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      contactPerson: 'Airport Manager',
      contactNumber: '1234567890',
      shippingAddress: 'Pune Airport VIP Lounge'
    },
    {
      name: 'Chennai Airport',
      type: 'Domestic',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      contactPerson: 'Airport Manager',
      contactNumber: '1234567890',
      shippingAddress: 'Chennai Airport VIP Lounge'
    },
    {
      name: 'Bhubneshwar Airport',
      type: 'Domestic',
      city: 'Bhubneshwar',
      state: 'Odisha',
      country: 'India',
      contactPerson: 'Airport Manager',
      contactNumber: '1234567890',
      shippingAddress: 'Bhubneshwar Airport VIP Lounge'
    },
    {
      name: 'Navy Library',
      type: 'Institutional',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      contactPerson: 'Commander',
      contactNumber: '1234567890',
      shippingAddress: 'Naval Base, Mumbai'
    }
  ];

  for (const lib of libraries) {
    const exists = await prisma.library.findFirst({ where: { name: lib.name } });
    if (!exists) {
      await prisma.library.create({ data: lib });
      console.log(`Created library: ${lib.name}`);
    } else {
        console.log(`Library already exists: ${lib.name}`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
