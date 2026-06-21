const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  const event = await prisma.event.findFirst({
    where: { name: { contains: 'Jalandhar Literary Event' } }
  });

  if (!event) {
    console.error('Jalandhar Literary Event not found!');
    return;
  }

  console.log(`Found event: ${event.name} (ID: ${event.id})`);

  const dummyAuthors = [
    {
      name: 'Ravi Verma Dummy',
      email: 'ravi.dummy@example.com',
      phone: '9876543210',
      bio: 'A passionate writer from Jalandhar.',
      city: 'Jalandhar',
      status: 'Active',
      books: [
        { title: 'The Echoes of Punjab', genre: 'Fiction', synopsis: 'A tale of history.', mrp: 299, stock: 100 },
        { title: 'Modern Recipes', genre: 'Non-Fiction', synopsis: 'Cooking guide.', mrp: 199, stock: 50 }
      ]
    },
    {
      name: 'Anita Desai Dummy',
      email: 'anita.dummy@example.com',
      phone: '8765432109',
      bio: 'Exploring the depths of human emotion.',
      city: 'Amritsar',
      status: 'Active',
      books: [
        { title: 'Whispering Winds', genre: 'Poetry', synopsis: 'Poems about nature.', mrp: 150, stock: 75 },
        { title: 'Silent Night', genre: 'Mystery', synopsis: 'A thrilling mystery.', mrp: 350, stock: 120 }
      ]
    },
    {
      name: 'Suresh Kumar Dummy',
      email: 'suresh.dummy@example.com',
      phone: '7654321098',
      bio: 'Writing self-help books to motivate youth.',
      city: 'Ludhiana',
      status: 'Active',
      books: [
        { title: 'Unlock Your Potential', genre: 'Self-Help', synopsis: 'Motivate yourself.', mrp: 250, stock: 200 },
        { title: 'Business 101', genre: 'Business', synopsis: 'Start your own venture.', mrp: 400, stock: 80 }
      ]
    }
  ];

  const hashedPassword = await bcrypt.hash('password123', 10);

  for (const authorData of dummyAuthors) {
    let author = await prisma.author.findUnique({ where: { email: authorData.email } });
    if (!author) {
      author = await prisma.author.create({
        data: {
          name: authorData.name,
          email: authorData.email,
          phone: authorData.phone,
          bio: authorData.bio,
          city: authorData.city,
          status: authorData.status
        }
      });
      console.log(`Created author: ${author.name}`);

      // Create author password
      await prisma.user.create({
         data: {
            email: author.email,
            password: hashedPassword,
            role: 'author',
            name: authorData.name
         }
      });
    }

    // Create books
    const createdBooks = [];
    for (const bookData of authorData.books) {
      const book = await prisma.book.create({
        data: {
          ...bookData,
          authorId: author.id,
          status: 'Active'
        }
      });
      createdBooks.push(book);
    }

    // Register author to event (Awaiting Approval)
    const existingRegistration = await prisma.eventAuthor.findFirst({
      where: { eventId: event.id, authorId: author.id }
    });

    if (!existingRegistration) {
      await prisma.eventAuthor.create({
        data: {
          eventId: event.id,
          authorId: author.id,
          optInStatus: 'Awaiting Approval',
          paymentScreenshot: '/dummy-screenshot.png'
        }
      });
    } else {
      await prisma.eventAuthor.update({
        where: { id: existingRegistration.id },
        data: { optInStatus: 'Awaiting Approval', paymentScreenshot: '/dummy-screenshot.png' }
      });
    }

    // Link books to event
    for (const b of createdBooks) {
      await prisma.eventBook.create({
        data: {
          eventId: event.id,
          authorId: author.id,
          bookId: b.id,
          listedStock: Math.floor(Math.random() * 20) + 10 // random listed stock 10-30
        }
      });
    }
    
    console.log(`Registered ${author.name} to event with ${createdBooks.length} books.`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
