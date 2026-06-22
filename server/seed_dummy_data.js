const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log("Seeding extensive dummy data with ALL fields filled...");

  // Dummy Images
  const dummyCoverUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop";
  const dummyPhotoUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop";
  const dummyQrCodeUrl = "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg";
  const dummyScreenshotUrl = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=400&auto=format&fit=crop";

  // Categories to seed
  const categories = [
    { genre: "Fiction", subGenre: "Science Fiction", sub: "Cyberpunk" },
    { genre: "Non-Fiction", subGenre: "History", sub: "World History" },
    { genre: "Children's Books", subGenre: "3-5 Years", sub: "Picture Books" },
    { genre: "Poetry", subGenre: "Modern Poetry", sub: "" },
    { genre: "Academic & Educational", subGenre: "Engineering", sub: "" }
  ];

  const dummyAuthors = [];

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const authorName = `Dummy Author ${i + 1}`;
    
    // Create an author with ALL fields filled
    const author = await prisma.author.create({
      data: {
        name: authorName,
        email: `dummy${i+1}@example.com`,
        phone: `900000000${i}`,
        bio: `This is a comprehensive, highly detailed bio for ${authorName}. They have spent decades researching and writing about ${cat.genre}, specifically focusing on ${cat.subGenre}. Their work is critically acclaimed worldwide.`,
        photoUrl: dummyPhotoUrl,
        status: i % 2 === 0 ? "Approved" : "Pending",
        rejectionReason: i % 2 !== 0 ? "Pending admin review of submitted documents." : null,
        transactionId: `TXN-DUMMY-${1000 + i}`,
        paymentScreenshot: dummyScreenshotUrl,
        whatsapp: `900000000${i}`,
        penName: `The Great ${cat.genre} Writer`,
        city: "Pune",
        state: "Maharashtra",
        instagram: `https://instagram.com/dummyauthor${i+1}`,
        facebook: `https://facebook.com/dummyauthor${i+1}`,
        qrCodeUrl: dummyQrCodeUrl,
        extraData: { isDummy: true, website: `https://dummyauthor${i+1}.com`, awards: ["Best Book 2023"] },
        books: {
          create: [
            {
              title: `The Comprehensive Guide to ${cat.genre} Vol 1`,
              subtitle: `A Deep Dive into ${cat.subGenre}`,
              genre: cat.genre,
              subGenre: cat.sub ? `${cat.subGenre} > ${cat.sub}` : cat.subGenre,
              synopsis: `An excellent, fully detailed dummy book covering everything you need to know about ${cat.genre}. It explores the profound intricacies of the subject matter and offers unprecedented insights.`,
              pages: 350 + i * 20,
              mrp: 299 + i * 50,
              coverUrl: dummyCoverUrl,
              status: "Approved",
              rejectionReason: null,
              overpriced: false,
              stock: 100 + i * 10,
              airportStock: 25,
              fairStock: 50,
              language: "English",
              isbn: `978-3-16-148410-${i}`,
              publisher: "Dummy Publishing House",
              publicationDate: `2024-0${1+i}-15`,
              edition: "1st Edition",
              format: "Paperback"
            },
            {
              title: `Unapproved ${cat.genre} Masterpiece`,
              subtitle: `Waiting for Approval`,
              genre: cat.genre,
              subGenre: cat.subGenre,
              synopsis: `A pending dummy book in ${cat.genre} that is currently awaiting admin verification before going live.`,
              pages: 200 + i * 15,
              mrp: 199 + i * 20,
              coverUrl: dummyCoverUrl,
              status: "Pending",
              rejectionReason: "Cover image needs higher resolution.",
              overpriced: true,
              stock: 0,
              airportStock: 0,
              fairStock: 0,
              language: "Marathi",
              isbn: `978-1-23-456789-${i}`,
              publisher: "Self-Published",
              publicationDate: `2025-0${1+i}-20`,
              edition: "Draft Edition",
              format: "Hardcover"
            }
          ]
        }
      },
      include: { books: true }
    });
    dummyAuthors.push(author);
  }

  // Create an event with ALL fields
  const event = await prisma.event.create({
    data: {
      name: "Dummy Annual Book Fair 2026",
      location: "Bal Gandharva Rang Mandir",
      date: "2026-08-10",
      duration: "5 days",
      description: "A large simulated event with multiple dummy authors featuring live interactions and massive book sales.",
      brochureUrl: dummyCoverUrl,
      bannerUrl: dummyCoverUrl,
      status: "Upcoming",
      commissionPercent: 10.5,
      commissionFlat: 50.0,
      broadcastStatus: "CustomersAlso",
      eventType: "Literature Festival",
      registrationFee: 500,
      feeType: "Per Author",
      eventAuthors: {
        create: dummyAuthors.map(a => ({
          authorId: a.id,
          optInStatus: "Opted-In",
          paymentScreenshot: dummyScreenshotUrl
        }))
      },
      eventBooks: {
        create: dummyAuthors.map(a => ({
          authorId: a.id,
          bookId: a.books[0].id,
          listedStock: a.books[0].fairStock,
          soldStock: 5,
          returnedStock: a.books[0].fairStock - 5
        }))
      }
    }
  });

  // Simulate Web Orders with ALL fields
  console.log("Simulating web orders...");
  for (let i = 0; i < 3; i++) {
    await prisma.order.create({
      data: {
        customerName: `Dummy Web Customer ${i + 1}`,
        customerEmail: `webcustomer${i+1}@example.com`,
        customerPhone: "8000000000",
        address: "123 Dummy Street, Apt 4B, Pune, Maharashtra 411001",
        amount: dummyAuthors[i].books[0].mrp + dummyAuthors[i+1].books[0].mrp,
        paymentScreenshot: dummyScreenshotUrl,
        transactionId: `TXN-WEB-${2000 + i}`,
        status: i === 0 ? "Pending Verification" : "Confirmed",
        items: {
          create: [
            { 
              bookId: dummyAuthors[i].books[0].id, 
              quantity: 1, 
              status: "Dispatched",
              dispatchedAt: new Date(),
              trackingNumber: `TRACK-${8000+i}`,
              rejectionReason: null
            },
            { 
              bookId: dummyAuthors[i+1].books[0].id, 
              quantity: 1, 
              status: "Pending Verification",
              trackingNumber: null,
              rejectionReason: "Awaiting payment confirmation."
            }
          ]
        }
      }
    });
  }

  // Simulate POS Orders with ALL fields
  console.log("Simulating POS orders...");
  for (let i = 0; i < 2; i++) {
    await prisma.posOrder.create({
      data: {
        authorId: dummyAuthors[i].id,
        eventId: event.id,
        totalAmount: dummyAuthors[i].books[0].mrp * 2,
        paymentMethod: i === 0 ? "UPI" : "Cash",
        paymentStatus: "CONFIRMED",
        paymentReference: i === 0 ? `UPI-REF-${3000 + i}` : null,
        saleSource: "BOOK_FAIR",
        items: {
          create: [
            { bookId: dummyAuthors[i].books[0].id, quantity: 2, price: dummyAuthors[i].books[0].mrp }
          ]
        }
      }
    });
  }
  
  // Simulate Book Reviews
  console.log("Simulating book reviews...");
  await prisma.bookReview.create({
    data: {
      bookId: dummyAuthors[0].books[0].id,
      reviewerName: "Dummy Reviewer",
      rating: 5,
      comment: "An absolutely fantastic read! Highly recommended for anyone interested in this topic."
    }
  });

  // Simulate Contact Inquiry
  await prisma.contactInquiry.create({
    data: {
      name: "Dummy Inquirer",
      email: "inquiry@dummy.com",
      message: "I would like to know more about the upcoming Dummy Book Fair."
    }
  });

  console.log("Dummy data seeded successfully! All fields 100% populated.");
}

async function clear() {
  console.log("Clearing dummy data...");
  const dummyAuthors = await prisma.author.findMany({
    where: { email: { startsWith: 'dummy' } }
  });
  
  const authorIds = dummyAuthors.map(a => a.id);
  
  if (authorIds.length > 0) {
    const dummyBooks = await prisma.book.findMany({ where: { authorId: { in: authorIds } } });
    const bookIds = dummyBooks.map(b => b.id);
    
    await prisma.posOrderItem.deleteMany({ where: { bookId: { in: bookIds } } });
    await prisma.posOrder.deleteMany({ where: { authorId: { in: authorIds } } });
    
    await prisma.orderItem.deleteMany({ where: { bookId: { in: bookIds } } });
    
    const emptyOrders = await prisma.order.findMany({
      where: { items: { none: {} } }
    });
    const emptyOrderIds = emptyOrders.map(o => o.id);
    if (emptyOrderIds.length > 0) {
      await prisma.order.deleteMany({ where: { id: { in: emptyOrderIds } } });
    }
    
    await prisma.bookReview.deleteMany({ where: { bookId: { in: bookIds } } });

    await prisma.eventBook.deleteMany({ where: { authorId: { in: authorIds } } });
    await prisma.eventAuthor.deleteMany({ where: { authorId: { in: authorIds } } });
    
    await prisma.book.deleteMany({ where: { authorId: { in: authorIds } } });
    await prisma.author.deleteMany({ where: { id: { in: authorIds } } });
  }

  await prisma.event.deleteMany({ where: { name: { startsWith: 'Dummy' } } });
  await prisma.contactInquiry.deleteMany({ where: { name: { startsWith: 'Dummy' } } });

  console.log("All dummy data erased completely!");
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--clear')) {
    await clear();
  } else if (args.includes('--seed')) {
    await seed();
  } else {
    console.log("Please specify --seed or --clear");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
