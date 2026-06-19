const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const dummyAuthors = [
    { name: 'Aarav Patel', email: 'aarav@example.com', phone: '9876543210', status: 'Pending', bio: 'A passionate writer from Pune exploring fiction.' },
    { name: 'Diya Sharma', email: 'diya@example.com', phone: '9876543211', status: 'Active', bio: 'Exploring the depths of non-fiction.' },
    { name: 'Rohan Gupta', email: 'rohan@example.com', phone: '9876543212', status: 'Rejected', rejectionReason: 'Incomplete payment verification', bio: 'An aspiring poet.' },
    { name: 'Sneha Desai', email: 'sneha@example.com', phone: '9876543213', status: 'Pending', bio: 'Children\'s book author.' },
    { name: 'Vikram Singh', email: 'vikram@example.com', phone: '9876543214', status: 'Active', bio: 'Science fiction enthusiast.' }
  ];

  const password = await bcrypt.hash('password123', 10);

  for (const authorData of dummyAuthors) {
    const existing = await prisma.user.findUnique({ where: { email: authorData.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          name: authorData.name,
          email: authorData.email,
          password: password,
          role: 'AUTHOR',
          phone: authorData.phone
        }
      });

      await prisma.author.create({
        data: {
          name: authorData.name,
          email: authorData.email,
          phone: authorData.phone,
          bio: authorData.bio,
          status: authorData.status,
          rejectionReason: authorData.rejectionReason,
          transactionId: `TXN${Math.floor(Math.random() * 1000000)}`,
          books: {
            create: {
              title: `${authorData.name}'s First Book`,
              genre: 'Fiction',
              synopsis: `A thrilling tale by ${authorData.name}.`,
              mrp: 299,
              status: authorData.status === 'Active' ? 'Approved' : 'Pending'
            }
          }
        }
      });
      console.log(`Created author ${authorData.email}`);
    } else {
      console.log(`Author ${authorData.email} already exists.`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
