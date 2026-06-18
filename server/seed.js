const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const galleryItems = [
  { title: "The Forgotten Equation", authorName: "Dr. Anita Rao", genre: "NF", synopsis: "A compelling look at ancient mathematics.", mrp: 299, coverUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&h=280&fit=crop&auto=format" },
  { title: "Monsoon Letters", authorName: "Priya Deshmukh", genre: "F", synopsis: "Letters exchanged during the Indian monsoon.", mrp: 249, coverUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=200&h=280&fit=crop&auto=format" },
  { title: "Pebbles on the Ghat", authorName: "Suresh Kulkarni", genre: "P", synopsis: "Poetry inspired by the western ghats.", mrp: 199, coverUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=280&fit=crop&auto=format" },
  { title: "Adventures of Tara", authorName: "Meera Shah", genre: "C", synopsis: "A young girl's adventures in a magical world.", mrp: 179, coverUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=280&fit=crop&auto=format" },
  { title: "Startup India", authorName: "Rahul Joshi", genre: "NF", synopsis: "The boom of startups in modern India.", mrp: 349, coverUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200&h=280&fit=crop&auto=format" },
  { title: "The Vermillion Sky", authorName: "Kavita Nair", genre: "F", synopsis: "A tale of love and loss under the vermillion sky.", mrp: 279, coverUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=200&h=280&fit=crop&auto=format" },
];

async function main() {
  console.log('Start seeding...');
  
  for (const item of galleryItems) {
    const author = await prisma.author.create({
      data: {
        name: item.authorName,
        email: `${item.authorName.replace(/\s+/g, '').toLowerCase()}@example.com`,
        phone: '1234567890',
        bio: 'An established author.',
        status: 'Approved',
        books: {
          create: {
            title: item.title,
            genre: item.genre,
            synopsis: item.synopsis,
            mrp: item.mrp,
            coverUrl: item.coverUrl,
            status: 'Approved'
          }
        }
      }
    });
    console.log(`Created author ${author.name} with book ${item.title}`);
  }
  
  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
