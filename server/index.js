require('dotenv').config();
// Reload trigger - database synced
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// --- IN-MEMORY CACHE ---
const cache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds default
function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > entry.ttl) { cache.delete(key); return null; }
  return entry.data;
}
function setCache(key, data, ttl = CACHE_TTL) {
  cache.set(key, { data, ts: Date.now(), ttl });
}
function invalidateCache(pattern) {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) cache.delete(key);
  }
}
let mailTransporter;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  mailTransporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to your email provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
} else {
  mailTransporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'windows'
  });
}

const sendNotificationEmail = async (to, subject, htmlBody) => {
  if (!mailTransporter || !to) return;
  try {
    let info = await mailTransporter.sendMail({
      from: '"Pune Authors\' Association" <noreply@puneauthors.com>',
      to,
      subject,
      html: htmlBody,
      text: htmlBody.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
    });
    console.log(`[EMAIL SENT] to ${to}: ${subject}`);
    
    // Extract OTP if it's an OTP email to print to console for easy testing
    const otpMatch = htmlBody.match(/<h2[^>]*>(\d{6})<\/h2>/);
    if (otpMatch) {
      console.log(`\n========================================`);
      console.log(`🔑 DEV MODE OTP: ${otpMatch[1]}`);
      console.log(`========================================\n`);
    }
  } catch (err) {
    console.error('Email failed:', err.message);
  }
};

// Helper: Build a standard email wrapper
const emailWrap = (heading, content) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f8; margin: 0; padding: 0; color: #222; }
  .wrap { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.08); }
  .header { background: #1a1a2e; color: #fff; padding: 28px 32px; }
  .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
  .header p { margin: 6px 0 0; font-size: 13px; color: #94a3b8; }
  .body { padding: 32px; }
  .body h2 { margin: 0 0 8px; font-size: 18px; color: #1a1a2e; }
  .body p { margin: 0 0 16px; font-size: 15px; line-height: 1.65; color: #444; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
  th { background: #f0f4ff; color: #1a1a2e; text-align: left; padding: 10px 14px; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
  td { padding: 10px 14px; border-bottom: 1px solid #f0f0f4; vertical-align: top; }
  .badge { display: inline-block; background: #22c55e; color: #fff; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; }
  .footer { padding: 20px 32px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f0f0f4; }
</style></head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>Pune Authors\' Association</h1>
      <p>puneauthors.com</p>
    </div>
    <div class="body">
      <h2>${heading}</h2>
      ${content}
    </div>
    <div class="footer">This is an automated message from the PAA platform. Please do not reply directly to this email.</div>
  </div>
</body></html>
`;

// Helper: Format INR amount
const inr = (n) => `₹${parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;


const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Set up local storage for file uploads (mocking AWS S3 for local dev)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Routes

// --- AUTHENTICATION ---

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, interests, role } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, phone, address, interests, role: role || 'CUSTOMER' }
    });
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    // Allow Pending authors to login so they can view their status dashboard
    if (user.role === 'AUTHOR') {
      const author = await prisma.author.findUnique({ where: { email } });
      if (author && author.status === 'Rejected') {
        // We still allow login if rejected, we will show rejected status in AuthorDashboardPage
      }
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});


app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    let authorProfile = null;
    let authorOrders = [];
    let customerOrders = [];

    if (user.role === 'AUTHOR') {
      authorProfile = await prisma.author.findUnique({
        where: { email: user.email },
        include: { books: true }
      });

      if (authorProfile && authorProfile.books.length > 0) {
        const bookIds = authorProfile.books.map(b => b.id);
        const orderItems = await prisma.orderItem.findMany({
          where: { bookId: { in: bookIds } },
          include: { order: true, book: true },
          orderBy: { createdAt: 'desc' }
        });
        authorOrders = orderItems.map(item => ({
          id: item.id,
          orderId: item.order.id,
          customerName: item.order.customerName,
        customerPhone: item.order.customerPhone,
        customerEmail: item.order.customerEmail,
          address: item.order.address,
          bookTitle: item.book.title,
          quantity: item.quantity,
          status: item.status,
          paymentScreenshot: item.order.paymentScreenshot,
          createdAt: item.createdAt
        }));
      }
    } else if (user.role === 'CUSTOMER') {
      customerOrders = await prisma.order.findMany({
        where: { customerEmail: user.email },
        orderBy: { createdAt: 'desc' },
        include: { 
          items: {
            include: { 
              book: { include: { author: true } }
            }
          }
        }
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, authorProfile, authorOrders, customerOrders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const { name, address } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name, address }
    });
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// --- BOOKS & AUTHORS ---

// 1. Get all approved books for catalogue
app.get('/api/books', async (req, res) => {
  const { genre } = req.query;
  const cacheKey = `books:${genre || 'all'}`;
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  const where = { status: 'Approved' };
  if (genre) where.genre = genre;

  const books = await prisma.book.findMany({
    where,
    include: { author: true }
  });
  setCache(cacheKey, books, 60 * 1000); // 60s cache
  res.json(books);
});

// 1b. Get single book by ID (with author + reviews)
app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        author: true,
        reviews: { orderBy: { createdAt: 'desc' } }
      }
    });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// Get reviews for a book
app.get('/api/books/:id/reviews', async (req, res) => {
  try {
    const reviews = await prisma.bookReview.findMany({
      where: { bookId: parseInt(req.params.id) },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Submit a review for a book
app.post('/api/books/:id/reviews', async (req, res) => {
  try {
    const { reviewerName, rating, comment } = req.body;
    if (!reviewerName || !rating || !comment) {
      return res.status(400).json({ error: 'Name, rating and comment are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    const review = await prisma.bookReview.create({
      data: {
        bookId: parseInt(req.params.id),
        reviewerName,
        rating: parseInt(rating),
        comment
      }
    });
    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});


// 2. Author Registration (creates author, user login, and their first book)
app.post('/api/authors/register', upload.any(), async (req, res) => {
  try {
    const { name, email, phone, password, bio, whatsapp, penName, city, state, instagram, facebook, transactionId, extraData, qualification, age, experience, skills, hobbies, whyJoining, aadharNumber, address } = req.body;
    
    // Check if email already in use
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    let booksArray = [];
    if (req.body.books) {
      try { booksArray = JSON.parse(req.body.books); } catch(e) {}
    }
    if (booksArray.length === 0 && req.body.title) {
       booksArray.push({
         title: req.body.title,
         subtitle: req.body.subtitle,
         genre: req.body.genre,
         subGenre: req.body.subGenre,
         synopsis: req.body.synopsis,
         pages: req.body.pages,
         mrp: req.body.mrp,
         stock: req.body.stock,
         language: req.body.language,
         isbn: req.body.isbn,
         publisher: req.body.publisher,
         publicationDate: req.body.publicationDate,
         edition: req.body.edition,
         format: req.body.format
       });
    }

    let photoUrl = null, paymentScreenshotUrl = null, qrCodeUrl = null;
    let covers = {};
    if (Array.isArray(req.files)) {
       for (const file of req.files) {
          if (file.fieldname === 'photo') photoUrl = `/uploads/${file.filename}`;
          if (file.fieldname === 'paymentScreenshot') paymentScreenshotUrl = `/uploads/${file.filename}`;
          if (file.fieldname === 'qrCode') qrCodeUrl = `/uploads/${file.filename}`;
          if (file.fieldname === 'cover') covers[0] = `/uploads/${file.filename}`;
          if (file.fieldname.startsWith('cover_')) {
             const idx = file.fieldname.split('_')[1];
             covers[idx] = `/uploads/${file.filename}`;
          }
       }
    }
    
    // Explicitly validate payment requirements
    if (!paymentScreenshotUrl || !transactionId) {
      return res.status(400).json({ error: 'Payment screenshot and Transaction ID are mandatory for registration.' });
    }

    // Create login user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'AUTHOR', address }
    });

    let author;
    try {
      author = await prisma.author.create({
      data: {
        name,
        email,
        phone,
        whatsapp,
        bio,
        penName,
        city,
        state,
        instagram,
        facebook,
        photoUrl,
        qrCodeUrl,
        transactionId,
        paymentScreenshot: paymentScreenshotUrl,
        qualification,
        age,
        experience,
        skills,
        hobbies,
        whyJoining,
        aadharNumber,
        address,
        extraData: extraData ? JSON.parse(extraData) : null,
        books: {
          create: booksArray.map((b, idx) => ({
            title: b.title,
            subtitle: b.subtitle,
            genre: b.genre,
            subGenre: b.subGenre,
            synopsis: b.synopsis,
            pages: parseInt(b.pages) || null,
            mrp: parseFloat(b.mrp),
            stock: parseInt(b.stock) || 0,
            language: b.language,
            isbn: b.isbn,
            publisher: b.publisher,
            publicationDate: b.publicationDate,
            edition: b.edition,
            format: b.format,
            coverUrl: covers[idx] || covers[0] || null,
            status: 'Pending'
          }))
        }
      },
      include: { books: true }
    });
    } catch (dbError) {
      // Rollback user if author fails
      await prisma.user.delete({ where: { email } });
      throw dbError;
    }

    invalidateCache('books');
    res.status(201).json(author);
  } catch (error) {
    console.error(error);
    require('fs').writeFileSync('last_error.log', error.stack || error.toString());
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// 3. Get Author Dashboard details (mocking auth by just email query for now)
app.get('/api/authors/:email', async (req, res) => {
  const author = await prisma.author.findUnique({
    where: { email: req.params.email },
    include: { books: true }
  });
  if (!author) return res.status(404).json({ error: 'Author not found' });
  res.json(author);
});

// 4. Operations Dashboard - Get all authors
app.get('/api/admin/authors', verifyToken, isAdmin, async (req, res) => {
  try {
    const authors = await prisma.author.findMany({
      include: { books: true, eventRegistrations: true }
    });
    const mapped = authors.map(a => ({
      ...a,
      joined: a.createdAt.toISOString().split('T')[0],
      totalBooks: a.books.length,
      eventsPart: a.eventRegistrations.length
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Delete Author
app.delete('/api/admin/authors/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const authorId = parseInt(req.params.id);
    // Delete related records to satisfy foreign key constraints
    await prisma.eventRegistration.deleteMany({ where: { authorId } });
    await prisma.formResponse.deleteMany({ where: { authorId } });
    
    const books = await prisma.book.findMany({ where: { authorId } });
    const bookIds = books.map(b => b.id);
    if (bookIds.length > 0) {
      await prisma.orderItem.deleteMany({ where: { bookId: { in: bookIds } } });
      await prisma.book.deleteMany({ where: { authorId } });
    }
    
    await prisma.author.delete({ where: { id: authorId } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// 5. Operations Dashboard - Approve Author
app.post('/api/admin/authors/:id/approve', verifyToken, isAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const author = await prisma.author.update({
    where: { id },
    data: { status: 'Active', rejectionReason: null }
  });
  // Approve their books too
  await prisma.book.updateMany({
    where: { authorId: id },
    data: { status: 'Approved' }
  });
  
  // Send approval email
  const emailContent = `
    <p>Dear ${author.name},</p>
    <p>Congratulations! Your author profile has been officially approved by the Pune Authors' Association editorial team.</p>
    <p>Your books are now live in the catalogue. You can log in to your dashboard to manage your inventory, track orders, and participate in upcoming events.</p>
    <p>Welcome to the community!</p>
  `;
  // Assuming emailWrap is available globally in index.js
  if (typeof sendNotificationEmail === 'function' && typeof emailWrap === 'function') {
    sendNotificationEmail(author.email, "Welcome to PAA - Your Profile is Approved!", emailWrap("Profile Approved", emailContent));
  }
  
  res.json(author);
});

// 5b. Operations Dashboard - Reject Author (with reason)
app.post('/api/admin/authors/:id/reject', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { reason } = req.body;
    const author = await prisma.author.update({
      where: { id },
      data: { status: 'Rejected', rejectionReason: reason || 'No reason provided.' }
    });
    
    // Send rejection email
    const emailContent = `
      <p>Dear ${author.name},</p>
      <p>We have reviewed your author profile application for the Pune Authors' Association.</p>
      <p>Unfortunately, your application has been rejected at this time for the following reason(s):</p>
      <p style="padding: 10px; background-color: #fef2f2; border-left: 4px solid #ef4444; color: #b91c1c;">
        <strong>${reason || 'No specific reason provided.'}</strong>
      </p>
      <p>Please log in to your dashboard to resolve these issues and update your profile. Once the necessary changes are made, your profile will be re-evaluated.</p>
    `;
    
    if (typeof sendNotificationEmail === 'function' && typeof emailWrap === 'function') {
      sendNotificationEmail(author.email, "Action Required: Your PAA Profile Status", emailWrap("Profile Review Update", emailContent));
    }
    
    res.json(author);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reject author' });
  }
});

// Admin: Edit author profile (bio, name, phone, whatsapp)
app.put('/api/admin/authors/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, bio, phone, whatsapp } = req.body;
    const author = await prisma.author.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(phone !== undefined && { phone }),
        ...(whatsapp !== undefined && { whatsapp }),
      }
    });
    res.json(author);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update author' });
  }
});

// Admin Dashboard Overview Stats
app.get('/api/admin/dashboard-stats', verifyToken, isAdmin, async (req, res) => {
  const cached = getCache('admin:dashboard-stats');
  if (cached) return res.json(cached);
  try {
    const totalAuthors = await prisma.author.count();
    const totalBooks = await prisma.book.count();
    const eventParticipations = await prisma.eventAuthor.count({
      where: { optInStatus: 'Opted-In' }
    });
    const pendingEventRegistrations = await prisma.eventAuthor.count({
      where: { optInStatus: 'Awaiting Approval' }
    });
    
    const orders = await prisma.order.findMany({
      where: { status: { in: ['Completed', 'Delivered', 'Shipped', 'Dispatched'] } },
      orderBy: { createdAt: 'asc' },
      include: { items: { include: { book: { include: { author: true } } } } }
    });

    const posOrders = await prisma.posOrder.findMany({
      include: {
        event: true,
        items: true
      }
    });

    const webRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
    const posRevenue = posOrders.reduce((sum, po) => sum + po.totalAmount, 0);
    const totalRevenue = webRevenue + posRevenue;

    // Revenue Data Generation
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueDataMap = {};
    
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      revenueDataMap[key] = { month: monthNames[d.getMonth()], revenue: 0, authors: 0 };
    }

    orders.forEach(o => {
      const d = new Date(o.createdAt);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (revenueDataMap[key]) {
        revenueDataMap[key].revenue += o.amount;
      }
    });

    const revenueData = Object.values(revenueDataMap);

    // Advanced Analytics Computations
    const salesByAuthorMap = {};
    const salesByGenreMap = {};
    const bookSalesMap = {};
    const customerPurchasesMap = {};

    orders.forEach(o => {
      // Customer Purchase History aggregation
      if (o.customerEmail) {
        if (!customerPurchasesMap[o.customerEmail]) customerPurchasesMap[o.customerEmail] = { email: o.customerEmail, name: o.customerName, totalSpent: 0, ordersCount: 0 };
        customerPurchasesMap[o.customerEmail].totalSpent += o.amount;
        customerPurchasesMap[o.customerEmail].ordersCount += 1;
      }

      o.items.forEach(item => {
        const authorName = item.book.author.name;
        const genre = item.book.genre || 'Other';
        const bookTitle = item.book.title;
        const itemRev = item.quantity * item.book.mrp;

        // Author Sales
        if (!salesByAuthorMap[authorName]) salesByAuthorMap[authorName] = { name: authorName, revenue: 0, units: 0 };
        salesByAuthorMap[authorName].revenue += itemRev;
        salesByAuthorMap[authorName].units += item.quantity;

        // Genre Sales
        if (!salesByGenreMap[genre]) salesByGenreMap[genre] = { name: genre, revenue: 0, units: 0 };
        salesByGenreMap[genre].revenue += itemRev;
        salesByGenreMap[genre].units += item.quantity;

        // Book Sales
        if (!bookSalesMap[bookTitle]) bookSalesMap[bookTitle] = { title: bookTitle, author: authorName, revenue: 0, units: 0 };
        bookSalesMap[bookTitle].revenue += itemRev;
        bookSalesMap[bookTitle].units += item.quantity;
      });
    });

    const salesByAuthor = Object.values(salesByAuthorMap).sort((a, b) => b.revenue - a.revenue);
    const salesByGenre = Object.values(salesByGenreMap).sort((a, b) => b.revenue - a.revenue);
    const topSellingBooks = Object.values(bookSalesMap).sort((a, b) => b.units - a.units).slice(0, 10);
    const topCustomers = Object.values(customerPurchasesMap).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10);

    // Event Sales Data (for the new Chart)
    const eventSalesMap = {};
    posOrders.forEach(po => {
      const eventName = po.event.name;
      if (!eventSalesMap[eventName]) {
        eventSalesMap[eventName] = { name: eventName, booksSold: 0 };
      }
      eventSalesMap[eventName].booksSold += po.items.reduce((sum, item) => sum + item.quantity, 0);
    });
    
    // Add any events that have no sales yet just so they appear on the chart
    const allEvents = await prisma.event.findMany({ select: { name: true } });
    allEvents.forEach(evt => {
      if (!eventSalesMap[evt.name]) eventSalesMap[evt.name] = { name: evt.name, booksSold: 0 };
    });

    const eventSalesData = Object.values(eventSalesMap);

    // Low Stock Alerts
    const lowStockAlerts = await prisma.book.findMany({
      where: { stock: { lt: 10 } },
      include: { author: true },
      take: 20
    });

    // Recent Activities
    const recentAuthors = await prisma.author.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
    const recentOrders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
    const recentEvents = await prisma.eventAuthor.findMany({ include: { author: true, event: true }, orderBy: { createdAt: 'desc' }, take: 5 });
    
    const activities = [];
    recentAuthors.forEach(a => activities.push({ id: `auth-${a.id}`, action: 'New Author Registration', subject: a.name, createdAt: a.createdAt, type: 'author' }));
    recentOrders.forEach(o => activities.push({ id: `ord-${o.id}`, action: 'Order Received', subject: `INR ${o.amount} from ${o.customerName}`, createdAt: o.createdAt, type: 'order' }));
    recentEvents.forEach(e => activities.push({ id: `evt-${e.id}`, action: 'Event RSVP', subject: `${e.author?.name || 'Author'} joined ${e.event?.name || 'Event'}`, createdAt: e.createdAt, type: 'event' }));

    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentActivities = activities.slice(0, 8);

    const result = { 
      totalAuthors, totalBooks, eventParticipations, totalRevenue, revenueData, recentActivities,
      salesByAuthor, salesByGenre, topSellingBooks, topCustomers, lowStockAlerts, eventSalesData, pendingEventRegistrations
    };
    setCache('admin:dashboard-stats', result, 45 * 1000); // 45s cache
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

// Admin Books
app.get('/api/admin/books', verifyToken, isAdmin, async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      include: { author: true, orderItems: { include: { order: true } } }
    });
    const mapped = books.map(b => {
      const sales = b.orderItems.filter(item => ['Completed', 'Dispatched', 'Delivered', 'Shipped'].includes(item.order.status)).reduce((sum, item) => sum + item.quantity, 0);
      return {
        ...b,
        authorName: b.author.name,
        isbn: `978-0-00-000${b.id}`, // Mock ISBN
        sales
      };
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.delete('/api/admin/books/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await prisma.book.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Admin: Edit book details (title, genre, subGenre, mrp, stock, synopsis)
app.put('/api/admin/books/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, genre, subGenre, mrp, stock, synopsis } = req.body;
    const book = await prisma.book.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(title !== undefined && { title }),
        ...(genre !== undefined && { genre }),
        ...(subGenre !== undefined && { subGenre: subGenre || null }),
        ...(mrp !== undefined && { mrp: parseFloat(mrp) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(synopsis !== undefined && { synopsis }),
      }
    });
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update book' });
  }
});


app.post('/api/admin/books/:id/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const book = await prisma.book.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'Approved', rejectionReason: null }
    });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve book' });
  }
});

app.post('/api/admin/books/:id/reject', verifyToken, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const book = await prisma.book.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'Rejected', rejectionReason: reason || "No reason provided." }
    });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject book' });
  }
});

// Admin Activities
app.get('/api/admin/activities', verifyToken, isAdmin, async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      include: { registrations: true },
      orderBy: { createdAt: 'desc' }
    });
    const mapped = activities.map(act => ({
      ...act,
      registeredAuthors: act.registrations.length,
      color: act.status === 'Completed' ? 'bg-[#5bc0de]' : 'bg-[#5cb85c]'
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/admin/activities', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, date, location, type } = req.body;
    const act = await prisma.activity.create({
      data: { name, date, city: location, type, charges: 0, status: 'Upcoming' }
    });
    res.json(act);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// --- NEW AUTHOR DASHBOARD ROUTES ---

// Admin Get Specific Author Dashboard Data
app.get('/api/admin/authors/:id/dashboard-data', verifyToken, isAdmin, async (req, res) => {
  try {
    const authorProfile = await prisma.author.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { 
        books: true,
        eventRegistrations: {
          include: { activity: true }
        }
      }
    });

    if (!authorProfile) return res.status(404).json({ error: 'Author profile not found' });

    let authorOrders = [];
    if (authorProfile.books.length > 0) {
      const bookIds = authorProfile.books.map(b => b.id);
      const orderItems = await prisma.orderItem.findMany({
        where: { bookId: { in: bookIds } },
        include: { order: true, book: true },
        orderBy: { createdAt: 'desc' }
      });
      
      authorOrders = orderItems.map(item => ({
        id: item.id,
        orderId: item.order.id,
        customerName: item.order.customerName,
        customerPhone: item.order.customerPhone,
        customerEmail: item.order.customerEmail,
        address: item.order.address,
        bookTitle: item.book.title,
        quantity: item.quantity,
        amount: (item.book.mrp * item.quantity),
        status: item.status,
        trackingNumber: item.trackingNumber,
        paymentScreenshot: item.order.paymentScreenshot,
        paymentVerified: item.order.status === 'Completed',
        paymentFailed: item.order.status === 'Payment Not Received',
        createdAt: item.createdAt,
        date: item.createdAt.toISOString().split('T')[0]
      }));
    }

    res.json({ authorProfile, authorOrders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch author dashboard data' });
  }
});

app.post('/api/author/reapply', verifyToken, async (req, res) => {
  try {
    const { name, phone, bio, whatsapp, transactionId, extraData } = req.body;
    let updateData = { status: 'Pending', rejectionReason: null };
    
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (bio) updateData.bio = bio;
    if (whatsapp) updateData.whatsapp = whatsapp;
    if (transactionId) updateData.transactionId = transactionId;
    if (extraData) updateData.extraData = extraData;

    const author = await prisma.author.update({
      where: { email: req.user.email },
      data: updateData
    });
    res.json(author);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reapply' });
  }
});

// Get Author Dashboard Data
app.get('/api/author/dashboard-data', verifyToken, async (req, res) => {
  const cacheKey = `author:dashboard:${req.user.email}`;
  // Skip cache if client requests a forced refresh (t= param present)
  if (!req.query.t) {
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);
  }
  try {
    const authorProfile = await prisma.author.findUnique({
      where: { email: req.user.email },
      include: { 
        books: true,
        eventRegistrations: {
          include: { activity: true }
        }
      }
    });

    if (!authorProfile) return res.status(404).json({ error: 'Author profile not found' });

    let authorOrders = [];
    if (authorProfile.books.length > 0) {
      const bookIds = authorProfile.books.map(b => b.id);
      const orderItems = await prisma.orderItem.findMany({
        where: { bookId: { in: bookIds } },
        include: { order: true, book: true },
        orderBy: { createdAt: 'desc' }
      });
      authorOrders = orderItems.map(item => ({
        id: item.id,
        orderId: item.order.id,
        customerName: item.order.customerName,
        customerPhone: item.order.customerPhone,
        customerEmail: item.order.customerEmail,
        address: item.order.address,
        bookTitle: item.book.title,
        quantity: item.quantity,
        amount: (item.book.mrp * item.quantity),
        status: item.status,
        trackingNumber: item.trackingNumber,
        paymentScreenshot: item.order.paymentScreenshot,
        paymentVerified: item.order.status === 'Completed',
        paymentFailed: item.order.status === 'Payment Not Received',
        createdAt: item.createdAt,
        date: item.createdAt.toISOString().split('T')[0]
      }));
    }

    let dynamicFields = [];
    try {
      const p = require('path').join(__dirname, 'settings.json');
      if (require('fs').existsSync(p)) {
        const settings = JSON.parse(require('fs').readFileSync(p));
        dynamicFields = settings.authorDynamicFields || [];
      }
    } catch(e) {}

    const eventInvites = await prisma.eventAuthor.findMany({
      where: { authorId: authorProfile.id },
      include: { event: true }
    });
    const listedBooks = await prisma.eventBook.findMany({
      where: { authorId: authorProfile.id }
    });
    const result = { authorProfile, authorOrders, dynamicFields, eventInvites, listedBooks };
    setCache(cacheKey, result, 20 * 1000); // 20s cache for dashboard
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Update Book Inventory (Stock)
app.put('/api/author/inventory/:id', verifyToken, async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    const { stock } = req.body;
    
    // Ensure book belongs to author
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });

    const updated = await prisma.book.update({
      where: { id: bookId, authorId: author.id },
      data: { stock: parseInt(stock) }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// Author: Update own bio / profile info
app.put('/api/author/profile/bio', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    const { bio, phone, whatsapp, name, penName, city, state, instagram, facebook, address, aadharNumber, qualification, age, experience, skills, hobbies } = req.body;
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });

    const updateData = {
      ...(bio !== undefined && { bio }),
      ...(phone !== undefined && { phone }),
      ...(whatsapp !== undefined && { whatsapp }),
      ...(name !== undefined && { name }),
      ...(penName !== undefined && { penName }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(instagram !== undefined && { instagram }),
      ...(facebook !== undefined && { facebook }),
      ...(address !== undefined && { address }),
      ...(aadharNumber !== undefined && { aadharNumber }),
      ...(qualification !== undefined && { qualification }),
      ...(age !== undefined && { age }),
      ...(experience !== undefined && { experience }),
      ...(skills !== undefined && { skills }),
      ...(hobbies !== undefined && { hobbies }),
      status: 'Pending', // Force re-approval by admin
      rejectionReason: null // Clear previous rejection if any
    };
    if (req.file) {
      updateData.photoUrl = `/uploads/${req.file.filename}`;
    }

    // Also update User record name and address if they changed
    if (name !== undefined || address !== undefined || phone !== undefined) {
      await prisma.user.update({
        where: { email: req.user.email },
        data: {
          ...(name !== undefined && { name }),
          ...(address !== undefined && { address }),
          ...(phone !== undefined && { phone })
        }
      });
    }

    const updated = await prisma.author.update({
      where: { id: author.id },
      data: updateData
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Author: Update book details (reapply)
app.put('/api/author/books/:id', verifyToken, async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    const { title, subtitle, genre, subGenre, mrp, stock, synopsis, pages, language, isbn, publisher, publicationDate, edition, format } = req.body;
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.authorId !== author.id) return res.status(403).json({ error: 'Not authorized' });

    const updated = await prisma.book.update({
      where: { id: bookId },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle: subtitle || null }),
        ...(genre !== undefined && { genre }),
        ...(subGenre !== undefined && { subGenre: subGenre || null }),
        ...(mrp !== undefined && { mrp: parseFloat(mrp) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(synopsis !== undefined && { synopsis }),
        ...(pages !== undefined && { pages: parseInt(pages) || null }),
        ...(language !== undefined && { language: language || null }),
        ...(isbn !== undefined && { isbn: isbn || null }),
        ...(publisher !== undefined && { publisher: publisher || null }),
        ...(publicationDate !== undefined && { publicationDate: publicationDate || null }),
        ...(edition !== undefined && { edition: edition || null }),
        ...(format !== undefined && { format: format || null }),
        status: 'Pending', // Setting back to pending for re-evaluation
        rejectionReason: null
      }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// Author: Update book cover image
app.put('/api/author/books/:id/cover', verifyToken, upload.single('cover'), async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    if (!req.file) return res.status(400).json({ error: 'No cover image uploaded' });

    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.authorId !== author.id) return res.status(403).json({ error: 'Not authorized' });

    const coverUrl = `/uploads/${req.file.filename}`;
    const updated = await prisma.book.update({
      where: { id: bookId },
      data: { coverUrl }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update cover' });
  }
});

// Add New Book by Existing Author
// --------------------------------------------------------
// Admin: Get all pending books (awaiting approval)
app.get('/api/admin/pending-books', verifyToken, isAdmin, async (req, res) => {
  try {
    const pendingBooks = await prisma.book.findMany({
      where: { status: 'Pending' },
      include: { author: true }
    });
    res.json(pendingBooks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pending books' });
  }
});

// Admin: Approve a pending book
app.post('/api/admin/books/:id/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    const updated = await prisma.book.update({
      where: { id: bookId },
      data: { status: 'Approved' }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to approve book' });
  }
});
app.post('/api/author/books', verifyToken, upload.single('cover'), async (req, res) => {
  try {
    const { title, subtitle, genre, subGenre, synopsis, pages, mrp, stock, overpriced, language, isbn, publisher, publicationDate, edition, format } = req.body;
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });

    const coverUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newBook = await prisma.book.create({
      data: {
        title,
        subtitle: subtitle || null,
        genre,
        subGenre: subGenre || null,
        synopsis,
        pages: parseInt(pages) || null,
        mrp: parseFloat(mrp),
        stock: parseInt(stock) || 0,
        overpriced: overpriced === 'true',
        language: language || null,
        isbn: isbn || null,
        publisher: publisher || null,
        publicationDate: publicationDate || null,
        edition: edition || null,
        format: format || null,
        coverUrl,
        authorId: author.id,
        status: 'Pending'
      }
    });

    res.status(201).json(newBook);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add book' });
  }
});

// Get Activities
app.get('/api/activities', async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Register for Activity
app.post('/api/author/activities/register', verifyToken, upload.single('paymentScreenshot'), async (req, res) => {
  try {
    const { activityId, booksIds, amount } = req.body;
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });

    const paymentScreenshot = req.file ? `/uploads/${req.file.filename}` : null;

    const registration = await prisma.eventRegistration.create({
      data: {
        authorId: author.id,
        activityId: parseInt(activityId),
        booksIds,
        amount: parseFloat(amount),
        paymentScreenshot
      }
    });
    res.status(201).json(registration);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// 6. Checkout - Create Order

app.put('/api/orders/:id/cancel', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = await prisma.order.findUnique({ where: { id }, include: { items: { include: { book: { include: { author: true } } } } } });
    if (!order) return res.status(404).json({ error: 'Not found' });
    if (order.customerEmail !== req.user.email) return res.status(403).json({ error: 'Forbidden' });
    
    // Only allow cancel if not dispatched
    const cannotCancel = order.items.some(i => i.status === 'Dispatched' || i.status === 'Completed');
    if (cannotCancel) return res.status(400).json({ error: 'Cannot cancel dispatched orders' });

    await prisma.order.update({ where: { id }, data: { status: 'Cancelled' } });
    await prisma.orderItem.updateMany({ where: { orderId: id }, data: { status: 'Cancelled' } });
    
    for (const item of order.items) {
      if (item.status === 'Accepted') {
         await prisma.book.update({
           where: { id: item.bookId },
           data: { stock: { increment: item.quantity } }
         });
      }
      if (item.book && item.book.author && item.book.author.email) {
         await sendNotificationEmail(item.book.author.email, 'Order Cancelled by Customer', `The order #PAA-${id.toString().padStart(4, '0')} for your book "${item.book.title}" was cancelled by the customer.`);
      }
    }
    
    // Send email
    await sendNotificationEmail(req.user.email, 'Order Cancelled', `Your order #PAA-${id.toString().padStart(4, '0')} has been cancelled successfully.`);
    
    res.json({ message: 'Order cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

app.post('/api/orders', verifyToken, upload.single('paymentScreenshot'), async (req, res) => {
  try {
    const { customerName, customerPhone, address, amount, items, transactionId } = req.body;
    const parsedItems = Array.isArray(items) ? items : JSON.parse(items);
    const paymentScreenshot = req.file ? `/uploads/${req.file.filename}` : null;

    // Validate stock before allowing order placement
    for (const item of parsedItems) {
      const book = await prisma.book.findUnique({ where: { id: parseInt(item.bookId) } });
      if (!book) return res.status(404).json({ error: `Book ID ${item.bookId} not found` });
      if (book.stock < parseInt(item.quantity)) {
        return res.status(400).json({ error: `Insufficient stock for book: ${book.title}. Available: ${book.stock}` });
      }
    }

    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail: req.user.email,
        customerPhone,
        address,
        amount: parseFloat(amount),
        paymentScreenshot,
        transactionId: transactionId || null,
        items: {
          create: parsedItems.map(item => ({
            bookId: parseInt(item.bookId),
            quantity: parseInt(item.quantity)
          }))
        }
      },
      include: { items: { include: { book: { include: { author: true } } } } }
    });

    const orderId = `PAA-${String(order.id).padStart(4, '0')}`;
    const orderDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    // --- Email to CUSTOMER ---
    const itemRowsCustomer = order.items.map(item => `
      <tr>
        <td>${item.book.title}</td>
        <td>${item.book.author?.name || 'Unknown'}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">${inr(item.book.mrp * item.quantity)}</td>
      </tr>`).join('');

    await sendNotificationEmail(
      req.user.email,
      `Order Confirmed #${orderId} — Pune Authors' Association`,
      emailWrap(`Order Placed Successfully! 🎉`, `
        <p>Hi <strong>${customerName}</strong>, your order has been received and is now awaiting author approval.</p>
        <table>
          <thead><tr><th>Book</th><th>Author</th><th>Qty</th><th>Amount</th></tr></thead>
          <tbody>${itemRowsCustomer}</tbody>
          <tfoot><tr><td colspan="3" style="font-weight:700;text-align:right">Total</td><td style="font-weight:700;text-align:right">${inr(order.amount)}</td></tr></tfoot>
        </table>
        <table>
          <tr><td><strong>Order ID</strong></td><td>${orderId}</td></tr>
          <tr><td><strong>Date</strong></td><td>${orderDate}</td></tr>
          <tr><td><strong>Delivery Address</strong></td><td>${address}</td></tr>
          ${transactionId ? `<tr><td><strong>Transaction ID</strong></td><td>${transactionId}</td></tr>` : ''}
        </table>
        <p>The author will review your payment and approve the order. You will receive another email once approved.</p>
      `)
    );

    // --- Email to each AUTHOR ---
    const authorEmails = new Set();
    for (const item of order.items) {
      const authorEmail = item.book?.author?.email;
      if (!authorEmail || authorEmails.has(authorEmail)) continue;
      authorEmails.add(authorEmail);

      const authorItems = order.items.filter(i => i.book?.author?.email === authorEmail);
      const itemRowsAuthor = authorItems.map(i => `
        <tr>
          <td>${i.book.title}</td>
          <td style="text-align:center">${i.quantity}</td>
          <td style="text-align:right">${inr(i.book.mrp * i.quantity)}</td>
        </tr>`).join('');
      const authorTotal = authorItems.reduce((s, i) => s + i.book.mrp * i.quantity, 0);

      await sendNotificationEmail(
        authorEmail,
        `New Order #${orderId} for Your Book — Action Required`,
        emailWrap(`📦 New Order Received — Your Action Required`, `
          <p>Hi <strong>${item.book.author.name}</strong>, a new order has been placed for your book(s). Please log in to your dashboard to <strong>Approve or Reject</strong> this order.</p>
          <table>
            <thead><tr><th>Book</th><th>Qty</th><th>Amount</th></tr></thead>
            <tbody>${itemRowsAuthor}</tbody>
            <tfoot><tr><td colspan="2" style="font-weight:700;text-align:right">Your Total</td><td style="font-weight:700;text-align:right">${inr(authorTotal)}</td></tr></tfoot>
          </table>
          <table>
            <tr><td><strong>Order ID</strong></td><td>${orderId}</td></tr>
            <tr><td><strong>Order Date</strong></td><td>${orderDate}</td></tr>
            <tr><td><strong>Customer Name</strong></td><td>${customerName}</td></tr>
            <tr><td><strong>Customer Phone</strong></td><td>${customerPhone || 'Not provided'}</td></tr>
            <tr><td><strong>Delivery Address</strong></td><td>${address}</td></tr>
            ${transactionId ? `<tr><td><strong>Transaction ID</strong></td><td>${transactionId}</td></tr>` : ''}
          </table>
          <p><span class="badge">⚡ Action Needed</span> &nbsp;Log in at <a href="http://localhost:5173/author/dashboard">your dashboard</a> to approve or reject this order.</p>
        `)
      );

      invalidateCache(`author:dashboard:${authorEmail}`);
    }

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Order failed' });
  }
});

// Author: Approve a pending order item
app.put('/api/order-items/:id/author-approve', verifyToken, async (req, res) => {
  try {
    const orderItemId = parseInt(req.params.id);
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { book: { include: { author: true } }, order: true }
    });
    if (!orderItem || orderItem.book.authorId !== author.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Idempotency: Prevent double approval and double stock deduction
    if (orderItem.status !== 'Pending Verification') {
      return res.status(400).json({ error: 'Order is no longer pending verification.' });
    }
    
    // Prevent negative inventory
    if (orderItem.book.stock < orderItem.quantity) {
      return res.status(400).json({ error: `Insufficient stock to approve. Available: ${orderItem.book.stock}` });
    }

    const updated = await prisma.orderItem.update({
      where: { id: orderItemId },
      data: { status: 'Accepted' },
      include: { book: { include: { author: true } }, order: true }
    });

    // Deduct stock
    await prisma.book.update({
      where: { id: orderItem.bookId },
      data: { stock: { decrement: orderItem.quantity } }
    });

    const orderId = `PAA-${String(updated.order.id).padStart(4, '0')}`;
    const approvalDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const totalAmount = parseFloat(updated.book.mrp) * updated.quantity;

    // --- Email to CUSTOMER on approval ---
    if (updated.order?.customerEmail) {
      await sendNotificationEmail(
        updated.order.customerEmail,
        `Order Approved ✅ #${orderId} — ${updated.book.title}`,
        emailWrap(`Your Order Has Been Approved! 🎉`, `
          <p>Hi <strong>${updated.order.customerName}</strong>, great news! The author has approved your order.</p>
          <table>
            <tr><td><strong>Order ID</strong></td><td>${orderId}</td></tr>
            <tr><td><strong>Book</strong></td><td>${updated.book.title}</td></tr>
            <tr><td><strong>Author</strong></td><td>${updated.book.author?.name || author.name}</td></tr>
            <tr><td><strong>Quantity</strong></td><td>${updated.quantity}</td></tr>
            <tr><td><strong>Amount Paid</strong></td><td>${inr(totalAmount)}</td></tr>
            <tr><td><strong>Delivery Address</strong></td><td>${updated.order.address}</td></tr>
            <tr><td><strong>Approved On</strong></td><td>${approvalDate}</td></tr>
            ${updated.order.transactionId ? `<tr><td><strong>Your Transaction ID</strong></td><td>${updated.order.transactionId}</td></tr>` : ''}
          </table>
          <p>Your book will be packed and dispatched soon. The author will share a tracking number once dispatched.</p>
          <p>For queries, contact <strong>${author.name}</strong>${author.whatsapp ? ` on WhatsApp: ${author.whatsapp}` : ''} at ${author.email}.</p>
        `)
      );
    }

    // --- Email to AUTHOR with delivery instructions ---
    await sendNotificationEmail(
      author.email,
      `Order #${orderId} Approved — Pack & Dispatch`,
      emailWrap(`📦 Order Approved — Ready to Pack`, `
        <p>You have approved order <strong>${orderId}</strong>. Please pack the following and dispatch at the earliest.</p>
        <table>
          <tr><td><strong>Order ID</strong></td><td><strong>${orderId}</strong></td></tr>
          <tr><td><strong>Approved On</strong></td><td>${approvalDate}</td></tr>
          <tr><td><strong>Book Title</strong></td><td>${updated.book.title}</td></tr>
          <tr><td><strong>Quantity</strong></td><td>${updated.quantity}</td></tr>
          <tr><td><strong>Amount</strong></td><td>${inr(totalAmount)}</td></tr>
        </table>
        <h3 style="margin:24px 0 8px;font-size:16px;color:#1a1a2e;">📬 Ship To</h3>
        <table>
          <tr><td><strong>Name</strong></td><td>${updated.order.customerName}</td></tr>
          <tr><td><strong>Phone</strong></td><td>${updated.order.customerPhone || 'Not provided'}</td></tr>
          <tr><td><strong>Address</strong></td><td>${updated.order.address}</td></tr>
          ${updated.order.transactionId ? `<tr><td><strong>Transaction ID</strong></td><td>${updated.order.transactionId}</td></tr>` : ''}
        </table>
        <p style="margin-top:20px">Log in to your dashboard and click <strong>"Download Invoice"</strong> to get a printable slip for the delivery box.</p>
      `)
    );

    invalidateCache(`author:dashboard:${req.user.email}`);
    res.json({ ...updated, invoiceData: {
      orderId,
      approvalDate,
      book: { title: updated.book.title, mrp: updated.book.mrp },
      author: { name: author.name, email: author.email, phone: author.phone, whatsapp: author.whatsapp },
      customer: { name: updated.order.customerName, phone: updated.order.customerPhone, email: updated.order.customerEmail, address: updated.order.address },
      quantity: updated.quantity,
      total: totalAmount,
      transactionId: updated.order.transactionId
    }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to approve order' });
  }
});

// Author: Fetch full invoice data for a specific order item
app.get('/api/order-items/:id/invoice', verifyToken, async (req, res) => {
  try {
    const orderItemId = parseInt(req.params.id);
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { book: { include: { author: true } }, order: true }
    });
    if (!orderItem || orderItem.book.authorId !== author.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({
      orderId: `PAA-${String(orderItem.order.id).padStart(4, '0')}`,
      orderItemId: orderItem.id,
      status: orderItem.status,
      createdAt: orderItem.order.createdAt,
      book: { title: orderItem.book.title, mrp: orderItem.book.mrp, genre: orderItem.book.genre, coverUrl: orderItem.book.coverUrl },
      author: { name: author.name, email: author.email, phone: author.phone, whatsapp: author.whatsapp },
      customer: {
        name: orderItem.order.customerName,
        phone: orderItem.order.customerPhone,
        email: orderItem.order.customerEmail,
        address: orderItem.order.address
      },
      quantity: orderItem.quantity,
      total: parseFloat(orderItem.book.mrp) * orderItem.quantity,
      transactionId: orderItem.order.transactionId,
      trackingNumber: orderItem.trackingNumber
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Author: Reject a pending order item
app.put('/api/order-items/:id/author-reject', verifyToken, async (req, res) => {
  try {
    const orderItemId = parseInt(req.params.id);
    const { reason } = req.body;
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { book: true, order: true }
    });
    if (!orderItem || orderItem.book.authorId !== author.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.orderItem.update({
      where: { id: orderItemId },
      data: { status: 'Rejected', rejectionReason: reason || 'Rejected by author' },
      include: { book: true, order: true }
    });

    // Bug Fix #9: Restore stock if the order was already accepted
    if (orderItem.status === 'Accepted' || orderItem.status === 'Dispatched') {
       await prisma.book.update({
         where: { id: orderItem.bookId },
         data: { stock: { increment: orderItem.quantity } }
       });
    }

    if (updated.order?.customerEmail) {
      await sendNotificationEmail(updated.order.customerEmail, 'Order Rejected', `We\'re sorry. Your order for "${updated.book.title}" was rejected. Reason: ${reason || 'No specific reason provided.'}`);
    }

    invalidateCache(`author:dashboard:${req.user.email}`);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reject order' });
  }
});

// 7. Operations/Author Dashboard - Get all orders
app.get('/api/admin/reports/sales', verifyToken, isAdmin, async (req, res) => {
  try {
    const period = req.query.period || 'daily';
    const webOrders = await prisma.order.findMany({
      where: { status: { in: ['Completed', 'Delivered', 'Shipped', 'Dispatched'] } },
      include: { items: { include: { book: { include: { author: true } } } } }
    });
    
    const posOrders = await prisma.posOrder.findMany({
      include: { event: true, items: { include: { book: { include: { author: true } } } } }
    });

    const flatData = [];
    
    const getDateString = (dateObj) => {
      if (period === 'monthly') {
        return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === 'weekly') {
        const d = new Date(dateObj);
        d.setHours(0,0,0,0);
        d.setDate(d.getDate() + 4 - (d.getDay()||7));
        const yearStart = new Date(d.getFullYear(),0,1);
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
        return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
      } else if (period === 'yearly') {
        return `${dateObj.getFullYear()}`;
      } else if (period === 'lifelong') {
        return 'All Time';
      }
      return dateObj.toISOString().split('T')[0];
    };

    webOrders.forEach(o => {
      const dateStr = getDateString(o.createdAt);
      o.items.forEach(i => {
        flatData.push({
          Period: dateStr,
          Channel: 'Web',
          Event: '-',
          Author: i.book.author.name,
          BookTitle: i.book.title,
          QuantitySold: i.quantity,
          Revenue: i.quantity * i.book.mrp
        });
      });
    });

    posOrders.forEach(po => {
      const dateStr = getDateString(po.createdAt);
      po.items.forEach(i => {
        flatData.push({
          Period: dateStr,
          Channel: 'POS',
          Event: po.event.name,
          Author: i.book.author.name,
          BookTitle: i.book.title,
          QuantitySold: i.quantity,
          Revenue: i.quantity * i.price
        });
      });
    });

    const aggregated = {};
    flatData.forEach(row => {
      const key = `${row.Period}|${row.Channel}|${row.Event}|${row.Author}|${row.BookTitle}`;
      if (!aggregated[key]) {
        aggregated[key] = { ...row };
      } else {
        aggregated[key].QuantitySold += row.QuantitySold;
        aggregated[key].Revenue += row.Revenue;
      }
    });

    const sortedData = Object.values(aggregated).sort((a, b) => b.Period.localeCompare(a.Period) || a.Channel.localeCompare(b.Channel));

    if (sortedData.length === 0) {
      return res.status(404).json({ error: 'No data found for the selected criteria' });
    }

    if (req.query.format === 'json') {
      return res.json(sortedData);
    }

    const { Parser } = require('json2csv');
    const parser = new Parser();
    const csv = parser.parse(sortedData);
    res.header('Content-Type', 'text/csv');
    const today = new Date().toISOString().split('T')[0];
    res.attachment(`sales_report_${period}_${today}.csv`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

app.get('/api/admin/reports/chart', verifyToken, isAdmin, async (req, res) => {
  try {
    const period = req.query.period || 'daily';
    const webOrders = await prisma.order.findMany({
      where: { status: { in: ['Completed', 'Delivered', 'Shipped', 'Dispatched'] } },
      include: { items: { include: { book: true } } }
    });
    const posOrders = await prisma.posOrder.findMany({
      include: { items: true }
    });

    const getDateString = (dateObj) => {
      if (period === 'monthly') {
        return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === 'weekly') {
        const d = new Date(dateObj);
        d.setHours(0,0,0,0);
        d.setDate(d.getDate() + 4 - (d.getDay()||7));
        const yearStart = new Date(d.getFullYear(),0,1);
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
        return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
      } else if (period === 'yearly') {
        return `${dateObj.getFullYear()}`;
      } else if (period === 'lifelong') {
        return 'All Time';
      }
      return dateObj.toISOString().split('T')[0];
    };

    const aggregated = {};
    webOrders.forEach(o => {
      const dateStr = getDateString(o.createdAt);
      if (!aggregated[dateStr]) aggregated[dateStr] = { name: dateStr, Web: 0, POS: 0 };
      o.items.forEach(i => {
        aggregated[dateStr].Web += i.quantity;
      });
    });

    posOrders.forEach(po => {
      const dateStr = getDateString(po.createdAt);
      if (!aggregated[dateStr]) aggregated[dateStr] = { name: dateStr, Web: 0, POS: 0 };
      po.items.forEach(i => {
        aggregated[dateStr].POS += i.quantity;
      });
    });

    const chartData = Object.values(aggregated).sort((a, b) => a.name.localeCompare(b.name));
    res.json(chartData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate chart data' });
  }
});

// 7. Operations/Author Dashboard - Get all orders
app.get('/api/admin/orders/export', verifyToken, isAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: { include: { book: { include: { author: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    const flatData = [];
    orders.forEach(o => {
      o.items.forEach(i => {
        flatData.push({
          OrderId: `ORD-${o.id}`,
          Date: o.createdAt.toISOString().split('T')[0],
          Customer: o.customerName,
          Email: o.customerEmail,
          Phone: o.customerPhone,
          Address: o.address,
          BookTitle: i.book.title,
          Author: i.book.author.name,
          Quantity: i.quantity,
          Amount: o.amount,
          PaymentStatus: o.paymentScreenshot ? 'Paid' : 'Unpaid',
          OrderStatus: i.status,
          TrackingNumber: i.trackingNumber || ''
        });
      });
    });
    const { Parser } = require('json2csv');
    const parser = new Parser();
    const csv = parser.parse(flatData);
    res.header('Content-Type', 'text/csv');
    res.attachment('orders_export.csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Export failed' });
  }
});

app.get('/api/admin/orders', verifyToken, isAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: { include: { book: { include: { author: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    const mapped = orders.map(ord => ({
      id: `ORD-${ord.id.toString().padStart(4, '0')}`,
      dbId: ord.id,
      date: ord.createdAt.toISOString().split('T')[0],
      customer: ord.customerName,
      items: ord.items.map(i => ({ 
        id: i.id,
        title: i.book.title, 
        qty: i.quantity, 
        authorName: i.book.author.name,
        status: i.status,
        createdAt: i.createdAt,
        dispatchedAt: i.dispatchedAt,
        deliveredAt: i.deliveredAt,
        trackingNumber: i.trackingNumber
      })),
      total: ord.amount,
      status: ord.status === 'Pending Verification' ? 'Pending' : ord.status,
      payment: ord.paymentScreenshot ? 'Paid' : 'Unpaid',
      paymentScreenshot: ord.paymentScreenshot
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.put('/api/admin/orders/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status: req.body.status }
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.put('/api/order-items/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const orderItem = await prisma.orderItem.update({
      where: { id: parseInt(req.params.id) },
      data: { status }
    });
    res.json(orderItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});


app.put('/api/order-items/:id/reject', verifyToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const existing = await prisma.orderItem.findUnique({ where: { id: parseInt(req.params.id) } });

    const orderItem = await prisma.orderItem.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'Rejected', rejectionReason: reason },
      include: { order: true, book: true }
    });

    // Bug Fix #9: Restore stock if the order was already accepted
    if (existing && (existing.status === 'Accepted' || existing.status === 'Dispatched')) {
       await prisma.book.update({
         where: { id: existing.bookId },
         data: { stock: { increment: existing.quantity } }
       });
    }

    if (orderItem.order && orderItem.order.customerEmail) {
       await sendNotificationEmail(orderItem.order.customerEmail, 'Order Item Rejected', `Your order for book "${orderItem.book.title}" was rejected by the author. Reason: ${reason}`);
    }
    res.json(orderItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reject order' });
  }
});

app.put('/api/order-items/:id/accept', verifyToken, async (req, res) => {
  try {
    const existing = await prisma.orderItem.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { book: true }
    });
    if (!existing || existing.status !== 'Pending Verification') {
      return res.status(400).json({ error: 'Order is not pending verification.' });
    }
    if (existing.book.stock < existing.quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const orderItem = await prisma.orderItem.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'Accepted' },
      include: { book: { include: { author: true } } }
    });
    // Deduct stock immediately
    if (orderItem) {
       await prisma.book.update({
         where: { id: orderItem.bookId },
         data: { stock: { decrement: orderItem.quantity } }
       });
    }
    // Invalidate cache
    if (orderItem.book?.author?.email) invalidateCache(`author:dashboard:${orderItem.book.author.email}`);
    res.json(orderItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to accept order' });
  }
});


app.put('/api/order-items/:id/dispatch', verifyToken, async (req, res) => {
  try {
    const { trackingNumber } = req.body;
    const orderItem = await prisma.orderItem.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'Dispatched', trackingNumber, dispatchedAt: new Date() },
      include: { order: true, book: true }
    });
    
    if (orderItem.order && orderItem.order.customerEmail) {
       await sendNotificationEmail(orderItem.order.customerEmail, 'Order Dispatched', `Your book "${orderItem.book.title}" has been dispatched. Tracking No: ${trackingNumber}`);
    }
    
    res.json(orderItem);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to dispatch order' });
  }
});

app.put('/api/order-items/:id/acknowledge', verifyToken, async (req, res) => {
  try {
    const orderItem = await prisma.orderItem.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'Completed', deliveredAt: new Date() }
    });
    res.json(orderItem);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to acknowledge order' });
  }
});

// 8. Operations Dashboard - Verify Order
app.post('/api/admin/orders/:id/verify', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = await prisma.order.update({
      where: { id },
      data: { status: 'Completed' },
      include: { items: true }
    });
    
    res.json(order);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to verify order' });
  }
});

app.post('/api/admin/orders/:id/reject-payment', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = await prisma.order.update({
      where: { id },
      data: { status: 'Payment Not Received' }
    });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reject payment' });
  }
});

// 9. Contact Inquiry
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    // Save to DB
    const inquiry = await prisma.contactInquiry.create({
      data: { name, email, message }
    });

    res.json({ success: true, message: "Inquiry saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save inquiry' });
  }
});
// 10. Gallery Events
app.get('/api/gallery', async (req, res) => {
  try {
    const events = await prisma.galleryEvent.findMany({
      orderBy: { date: 'desc' },
      include: { images: true }
    });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch gallery events' });
  }
});

app.post('/api/admin/gallery', verifyToken, isAdmin, upload.single('photo'), async (req, res) => {
  try {
    const { location, place, city, date, duration, authors, booksSold, type, description } = req.body;
    let photoUrl = '';
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    const newEvent = await prisma.galleryEvent.create({
      data: {
        location,
        place,
        city,
        date: new Date(date),
        duration,
        authors: parseInt(authors),
        booksSold: parseInt(booksSold),
        type,
        description,
        photoUrl
      }
    });
    res.status(201).json(newEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload gallery event' });
  }
});
app.put('/api/admin/gallery/:id', verifyToken, isAdmin, upload.single('photo'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { location, place, city, date, duration, authors, booksSold, type, description } = req.body;
    let updateData = {
      location, place, city, date: new Date(date), duration, 
      authors: parseInt(authors), booksSold: parseInt(booksSold), type, description
    };
    if (req.file) {
      updateData.photoUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await prisma.galleryEvent.update({
      where: { id },
      data: updateData
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update gallery event' });
  }
});

app.delete('/api/admin/gallery/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.galleryEvent.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete gallery event' });
  }
});

app.post('/api/admin/gallery/:id/images', verifyToken, isAdmin, upload.single('photo'), async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { caption, dateTaken } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    
    let galleryEvent = await prisma.galleryEvent.findUnique({ where: { eventId } });
    if (!galleryEvent) {
      const evt = await prisma.event.findUnique({ where: { id: eventId } });
      if (!evt) return res.status(404).json({ error: 'Event not found' });
      
      galleryEvent = await prisma.galleryEvent.create({
        data: {
          eventId,
          location: evt.name,
          place: evt.location,
          city: '',
          date: evt.date ? new Date(evt.date) : new Date(),
          duration: evt.duration || '1 Day',
          authors: 0,
          booksSold: 0,
          type: evt.eventType || 'Literary Event',
          description: evt.description || evt.name,
          photoUrl: evt.bannerUrl || ''
        }
      });
    }

    const image = await prisma.galleryImage.create({
      data: {
        galleryEventId: galleryEvent.id,
        url: `/uploads/${req.file.filename}`,
        caption: caption || null,
        dateTaken: dateTaken ? new Date(dateTaken) : null
      }
    });
    res.status(201).json(image);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add image' });
  }
});

app.delete('/api/admin/gallery/images/:imageId', verifyToken, isAdmin, async (req, res) => {
  try {
    const imageId = parseInt(req.params.imageId);
    await prisma.galleryImage.delete({ where: { id: imageId } });
    res.json({ success: true });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});


// EVENT REGISTRATIONS FOR ADMIN
app.get('/api/admin/events/:id/registrations', verifyToken, isAdmin, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const registrations = await prisma.eventAuthor.findMany({
      where: { eventId, optInStatus: { not: 'Pending' } },
      include: {
        author: true
      }
    });
    
    // Get books for each author
    const eventBooks = await prisma.eventBook.findMany({
      where: { eventId },
      include: { book: true }
    });
    
    const detailedRegistrations = registrations.map(reg => {
      const authorBooks = eventBooks.filter(eb => eb.authorId === reg.authorId);
      
      // Calculate category breakdown
      const categoryCounts = {};
      authorBooks.forEach(ab => {
        const cat = ab.book.category || 'Uncategorized';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + ab.listedStock;
      });
      
      return {
        ...reg,
        books: authorBooks,
        categoryCounts
      };
    });
    
    res.json(detailedRegistrations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

app.post('/api/admin/events/:eventId/author/:authorId/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const authorId = parseInt(req.params.authorId);
    
    await prisma.eventAuthor.updateMany({
      where: { eventId, authorId },
      data: { optInStatus: 'Opted-In' }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve' });
  }
});

app.post('/api/admin/events/:eventId/author/:authorId/reject', verifyToken, isAdmin, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const authorId = parseInt(req.params.authorId);
    
    await prisma.eventAuthor.updateMany({
      where: { eventId, authorId },
      data: { optInStatus: 'Rejected' }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject' });
  }
});

// --- FORMS MANAGEMENT ---

// Admin: Get all form templates
app.get('/api/admin/forms', verifyToken, isAdmin, async (req, res) => {
  try {
    const forms = await prisma.formTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(forms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// Admin: Create a new form template
app.post('/api/admin/forms', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, type, description, fields } = req.body;
    const form = await prisma.formTemplate.create({
      data: { title, type: type || 'Literary Events', description, fields }
    });
    res.status(201).json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create form' });
  }
});

// Admin: Delete a form template
app.delete('/api/admin/forms/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.formResponse.deleteMany({ where: { formTemplateId: id } });
    await prisma.formTemplate.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete form' });
  }
});

// Admin: Get responses for a form
app.get('/api/admin/forms/:id/responses', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const responses = await prisma.formResponse.findMany({
      where: { formTemplateId: id },
      include: { author: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(responses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch form responses' });
  }
});

// Author: Get available forms
app.get('/api/author/forms', verifyToken, async (req, res) => {
  try {
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });
    
    const forms = await prisma.formTemplate.findMany({ orderBy: { createdAt: 'desc' } });
    const responses = await prisma.formResponse.findMany({
      where: { authorId: author.id }
    });
    const submittedFormIds = responses.map(r => r.formTemplateId);
    
    const formsWithStatus = forms.map(f => ({
      ...f,
      submitted: submittedFormIds.includes(f.id)
    }));
    
    res.json(formsWithStatus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// Author: Submit a form response
app.post('/api/author/forms/:id/submit', verifyToken, async (req, res) => {
  try {
    const formId = parseInt(req.params.id);
    const { answers } = req.body;
    
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });
    
    const existing = await prisma.formResponse.findFirst({
      where: { formTemplateId: formId, authorId: author.id }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'You have already submitted this form.' });
    }
    
    const response = await prisma.formResponse.create({
      data: {
        formTemplateId: formId,
        authorId: author.id,
        answers
      }
    });
    
    res.status(201).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit form' });
  }
});


// --- QUERIES (SUPPORT) ---

// Author: Get their own queries
app.get('/api/author/queries', verifyToken, async (req, res) => {
  try {
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });
    const queries = await prisma.query.findMany({
      where: { authorId: author.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(queries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch queries' });
  }
});

// Author: Create a new query
app.post('/api/author/queries', verifyToken, async (req, res) => {
  try {
    const { subject, message } = req.body;
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });
    const query = await prisma.query.create({
      data: {
        authorId: author.id,
        subject,
        message
      }
    });
    res.status(201).json(query);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create query' });
  }
});

// Admin: Get all queries
app.get('/api/admin/queries', verifyToken, isAdmin, async (req, res) => {
  try {
    const queries = await prisma.query.findMany({
      include: { 
        author: { select: { name: true, email: true } },
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(queries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch all queries' });
  }
});

// Admin: Reply to a query
app.put('/api/admin/queries/:id/reply', verifyToken, isAdmin, async (req, res) => {
  try {
    const { reply } = req.body;
    const id = parseInt(req.params.id);
    const query = await prisma.query.update({
      where: { id },
      data: {
        reply,
        status: 'Answered'
      }
    });
    res.json(query);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reply to query' });
  }
});


// Customer: Get their own queries
app.get('/api/customer/queries', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user.email } });
    if (!user) return res.status(404).json({ error: 'Not found' });
    const queries = await prisma.query.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(queries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch queries' });
  }
});

// Customer: Create a new query
app.post('/api/customer/queries', verifyToken, async (req, res) => {
  try {
    const { subject, message } = req.body;
    const user = await prisma.user.findUnique({ where: { email: req.user.email } });
    if (!user) return res.status(404).json({ error: 'Not found' });
    const query = await prisma.query.create({
      data: {
        userId: user.id,
        subject,
        message
      }
    });
    res.status(201).json(query);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create query' });
  }
});

// Start server
// --- DYNAMIC AUTHOR FIELDS ---
app.get('/api/admin/author-fields', verifyToken, isAdmin, (req, res) => {
    try {
        const settings = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'settings.json')));
        res.json(settings.authorDynamicFields || []);
    } catch (e) {
        res.json([]);
    }
});

app.get('/api/author-fields', (req, res) => {
    try {
        const settings = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'settings.json')));
        res.json(settings.authorDynamicFields || []);
    } catch (e) {
        res.json([]);
    }
});

app.post('/api/admin/author-fields', verifyToken, isAdmin, (req, res) => {
    try {
        const fields = req.body.fields;
        const settingsPath = require('path').join(__dirname, 'settings.json');
        let settings = {};
        if (require('fs').existsSync(settingsPath)) {
            settings = JSON.parse(require('fs').readFileSync(settingsPath));
        }
        settings.authorDynamicFields = fields;
        require('fs').writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to save fields' });
    }
});

app.put('/api/author/profile/extra', verifyToken, async (req, res) => {
    try {
        const author = await prisma.author.findUnique({ where: { email: req.user.email } });
        if (!author) return res.status(404).json({ error: "Author not found" });
        await prisma.author.update({
            where: { id: author.id },
            data: { extraData: req.body.extraData }
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update extra data' });
    }
});


// --- DYNAMIC AUTHOR FIELDS ---
app.get('/api/admin/author-fields', verifyToken, isAdmin, (req, res) => {
    try {
        const settings = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'settings.json')));
        res.json(settings.authorDynamicFields || []);
    } catch(e) { res.json([]); }
});

app.post('/api/admin/author-fields', verifyToken, isAdmin, (req, res) => {
    try {
        const p = require('path').join(__dirname, 'settings.json');
        const settings = require('fs').existsSync(p) ? JSON.parse(require('fs').readFileSync(p)) : {};
        settings.authorDynamicFields = req.body.fields;
        require('fs').writeFileSync(p, JSON.stringify(settings, null, 2));
        res.json({ success: true });
    } catch(e) { res.status(500).json({ error: 'Failed to save settings' }); }
});

app.put('/api/author/profile/extra', verifyToken, async (req, res) => {
    try {
        const author = await prisma.author.findUnique({ where: { email: req.user.email } });
        await prisma.author.update({
            where: { id: author.id },
            data: { extraData: req.body }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save extra data' });
    }
});



// --- AUTHOR EVENTS MANAGEMENT ---
app.get('/api/author/events', verifyToken, async (req, res) => {
  const cacheKey = `author:events:${req.user.email}`;
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);
  try {
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(404).json({ error: 'Author not found' });

    const eventInvites = await prisma.eventAuthor.findMany({
      where: { authorId: author.id },
      include: { event: true }
    });
    
    const books = await prisma.book.findMany({ where: { authorId: author.id, status: 'Approved' }});
    const listedBooks = await prisma.eventBook.findMany({ where: { authorId: author.id } });

    // All past events (for the gallery / history section in author dashboard)
    const pastEvents = await prisma.event.findMany({ 
      where: { status: 'Past' }, 
      orderBy: { date: 'desc' },
      include: {
        _count: { select: { eventAuthors: { where: { optInStatus: 'Opted-In' } }, eventBooks: true } }
      }
    });

    const result = { eventInvites, books, listedBooks, pastEvents };
    setCache(cacheKey, result, 30 * 1000);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.post('/api/author/events/:eventId/opt-in', verifyToken, upload.single('paymentScreenshot'), async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    let booksToLink = [];
    if (req.body.booksToLink) {
      booksToLink = JSON.parse(req.body.booksToLink);
    }
    
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    
    let paymentScreenshot = null;
    if (req.file) {
      paymentScreenshot = `/uploads/${req.file.filename}`;
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    // Validate payment screenshot requirement
    if (event.registrationFee > 0 && !paymentScreenshot) {
      // Allow if they already have an existing screenshot attached to their EventAuthor profile
      const existingOptIn = await prisma.eventAuthor.findFirst({ where: { eventId, authorId: author.id } });
      if (!existingOptIn || !existingOptIn.paymentScreenshot) {
        return res.status(400).json({ error: 'Payment screenshot is required for this event.' });
      }
    }

    // Wrap the entire process in a transaction to prevent partial updates and stock generation exploits
    await prisma.$transaction(async (tx) => {
      // ── STEP 1: Restore any previously committed stock back to Book.stock ──
      const previousEventBooks = await tx.eventBook.findMany({
        where: { eventId, authorId: author.id },
        include: { book: true }
      });
      for (const prev of previousEventBooks) {
        const uncommittedStock = prev.listedStock - prev.soldStock;
        if (uncommittedStock > 0) {
          await tx.book.update({
            where: { id: prev.bookId },
            data: { stock: { increment: uncommittedStock } }
          });
        }
      }

      // ── STEP 2: Validate new listing quantities against current (now-restored) Book.stock ──
      if (booksToLink && booksToLink.length > 0) {
        for (const b of booksToLink) {
          const book = await tx.book.findUnique({ where: { id: parseInt(b.bookId) } });
          if (!book) {
            throw new Error(`Book not found (ID: ${b.bookId})`);
          }
          const requested = parseInt(b.stock);
          if (requested <= 0) {
            throw new Error(`Listed quantity must be at least 1 for "${book.title}"`);
          }
          if (book.stock < requested) {
            throw new Error(`Insufficient stock for "${book.title}". You have ${book.stock} available but listed ${requested}.`);
          }
        }
      }

      // ── STEP 3: Update EventAuthor status ──
      await tx.eventAuthor.updateMany({
        where: { eventId, authorId: author.id },
        data: { 
          optInStatus: 'Awaiting Approval',
          ...(paymentScreenshot && { paymentScreenshot })
        }
      });
      
      // ── STEP 4: Remove old EventBook records and recreate ──
      await tx.eventBook.deleteMany({ where: { eventId, authorId: author.id } });
      
      // ── STEP 5: Deduct new listedStock from Book.stock and create EventBook records ──
      if (booksToLink && booksToLink.length > 0) {
         for (const b of booksToLink) {
           const requested = parseInt(b.stock);
           await tx.book.update({
             where: { id: parseInt(b.bookId) },
             data: { stock: { decrement: requested } }
           });
         }
         const eventBooksData = booksToLink.map((b) => ({
            eventId,
            authorId: author.id,
            bookId: parseInt(b.bookId),
            listedStock: parseInt(b.stock)
         }));
         await tx.eventBook.createMany({ data: eventBooksData });
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    if (error.message.includes('Insufficient stock') || error.message.includes('Listed quantity') || error.message.includes('Book not found')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to opt in' });
  }
});



// PUBLIC EVENTS ENDPOINT
app.get('/api/public/events', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { broadcastStatus: 'CustomersAlso' },
          { broadcastStatus: 'AuthorsOnly' } // let's show all active events? Or just CustomersAlso? Let's show CustomersAlso
        ]
      },
      include: {
         _count: { 
             select: { 
                eventBooks: true, 
                eventAuthors: { where: { optInStatus: 'Opted-In' } } 
             } 
         }
      },
      orderBy: { id: 'desc' }
    });
    // Actually let's just fetch all events that are CustomersAlso
    const publicEvents = events.filter(e => e.broadcastStatus === 'CustomersAlso');
    res.json(publicEvents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch public events' });
  }
});

// GET PUBLIC EVENT CATALOGUE
app.get('/api/events/:eventId/catalogue', async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    
    const listedBooks = await prisma.eventBook.findMany({
      where: { eventId },
      include: {
         book: true,
         author: { select: { name: true, bio: true, photoUrl: true } }
      }
    });
    
    res.json({ event, catalogue: listedBooks });
  } catch(err) {
    res.status(500).json({ error: 'Failed to fetch catalogue' });
  }
});

// --- EVENTS MANAGEMENT (PHASE 1) ---

app.post('/api/admin/events', verifyToken, isAdmin, upload.single('banner'), async (req, res) => {
  try {
    const { name, location, date, duration, eventType, registrationFee, feeType, description } = req.body;
    
    const existingEvent = await prisma.event.findFirst({
      where: { name, location, date }
    });
    if (existingEvent) {
      return res.status(400).json({ error: 'An event with the same name, location, and date already exists.' });
    }

    let bannerUrl = null;
    if (req.file) {
      bannerUrl = `/uploads/${req.file.filename}`;
    }

    const event = await prisma.event.create({
      data: { 
        name, 
        location, 
        date, 
        duration, 
        description: description || null,
        bannerUrl,
        status: 'Upcoming',
        broadcastStatus: 'CustomersAlso',
        eventType: eventType || 'Book Fair',
        registrationFee: registrationFee ? parseFloat(registrationFee) : 0,
        feeType: feeType || 'Per Author'
      }
    });

    const activeAuthors = await prisma.author.findMany({ where: { status: 'Active' } });
    const eventAuthorsData = activeAuthors.map(a => ({ eventId: event.id, authorId: a.id, optInStatus: 'Pending' }));
    await prisma.eventAuthor.createMany({ data: eventAuthorsData, skipDuplicates: true });
    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

app.get('/api/admin/events', verifyToken, isAdmin, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
         _count: { select: { eventAuthors: { where: { optInStatus: 'Opted-In' } }, eventBooks: true } },
         eventBooks: { select: { listedStock: true } },
         galleryEvent: { include: { images: true } }
      }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.put('/api/admin/events/:id', verifyToken, isAdmin, upload.single('banner'), async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { name, location, date, duration, status, eventType, registrationFee, feeType, description } = req.body;
    
    let updateData = { name, location, date, duration, status };
    if (description !== undefined) updateData.description = description;
    if (eventType !== undefined) updateData.eventType = eventType;
    if (registrationFee !== undefined) updateData.registrationFee = parseFloat(registrationFee);
    if (feeType !== undefined) updateData.feeType = feeType;
    
    if (req.file) {
      updateData.bannerUrl = `/uploads/${req.file.filename}`;
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data: updateData
    });
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

app.get('/api/admin/events/:id/report', verifyToken, isAdmin, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    
    const eventBooks = await prisma.eventBook.findMany({
      where: { eventId, listedStock: { gt: 0 } },
      include: { author: true, book: true }
    });
    
    const eventAuthors = await prisma.eventAuthor.findMany({
      where: { eventId },
      include: { author: true }
    });

    const authorsData = [];
    let totalRevenue = 0;
    let totalBooksSold = 0;
    let totalBooksListed = 0;
    const categorySales = {};

    for (const ea of eventAuthors) {
      if (ea.optInStatus === 'Pending') continue;
      
      const authorBooks = eventBooks.filter(eb => eb.authorId === ea.authorId);
      if (authorBooks.length === 0 && ea.optInStatus !== 'Opted-In') continue;

      let authorRevenue = 0;
      let authorSold = 0;
      let authorListed = 0;
      
      const booksList = authorBooks.map(eb => {
        const mrp = parseFloat(eb.book.mrp) || 0;
        const sold = eb.soldStock || 0;
        const revenue = mrp * sold;
        
        authorRevenue += revenue;
        authorSold += sold;
        authorListed += eb.listedStock;
        
        const cat = eb.book.genre || eb.book.category || 'Uncategorized';
        if (!categorySales[cat]) categorySales[cat] = { revenue: 0, sold: 0 };
        categorySales[cat].revenue += revenue;
        categorySales[cat].sold += sold;

        return {
          id: eb.id,
          title: eb.book.title,
          category: cat,
          mrp,
          listedStock: eb.listedStock,
          soldStock: sold,
          availableStock: eb.listedStock - sold,
          returnedStock: eb.returnedStock,
          revenue
        };
      });

      totalRevenue += authorRevenue;
      totalBooksSold += authorSold;
      totalBooksListed += authorListed;

      authorsData.push({
        id: ea.authorId,
        name: ea.author.name,
        email: ea.author.email,
        phone: ea.author.phone,
        optInStatus: ea.optInStatus,
        paymentScreenshot: ea.paymentScreenshot,
        totalRevenue: authorRevenue,
        totalSold: authorSold,
        totalListed: authorListed,
        books: booksList
      });
    }

    res.json({
      status: 'live',
      overallStats: {
        totalRevenue,
        totalBooksSold,
        totalBooksListed,
        totalAuthorsRegistered: authorsData.length
      },
      categorySales,
      authors: authorsData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

app.post('/api/admin/events/:id/notify-settlement', verifyToken, isAdmin, async (req, res) => {
  res.json({ message: 'Notification emails sent to pending authors!' });
});

app.put('/api/author/events/:id/settle', verifyToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(404).json({ error: 'Author not found' });
    const authorId = author.id;
    const { settlements } = req.body; // Array of { eventBookId, soldStock, returnedStock }
    
    await prisma.$transaction(async (tx) => {
      for (const settlement of settlements) {
         console.log('Processing settlement:', settlement);
         const eb = await tx.eventBook.findUnique({ where: { id: settlement.eventBookId }, include: { book: true } });
         console.log('Found EventBook:', !!eb, 'author match:', eb?.authorId === authorId, 'event match:', eb?.eventId === eventId);
         if (eb && eb.authorId === authorId && eb.eventId === eventId) {
            // Verify they haven't already settled this book
            console.log('Stock Check. listed:', eb.listedStock, 'sold:', eb.soldStock, 'returned:', eb.returnedStock);
            if (eb.listedStock !== eb.soldStock + eb.returnedStock) {
               await tx.eventBook.update({
                  where: { id: eb.id },
                  data: { soldStock: settlement.soldStock, returnedStock: settlement.returnedStock }
               });
               // Add returned stock back to inventory safely using atomic increment
               await tx.book.update({
                  where: { id: eb.bookId },
                  data: { stock: { increment: settlement.returnedStock } }
               });
            }
         }
      }
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit settlement' });
  }
});

app.delete('/api/admin/events/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    await prisma.event.delete({ where: { id: eventId } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

app.post('/api/admin/events/:id/broadcast', verifyToken, isAdmin, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { target } = req.body; // 'Authors' or 'Customers'
    
    if (target === 'Authors') {
       await prisma.event.update({
         where: { id: eventId },
         data: { broadcastStatus: 'AuthorsOnly' }
       });
       
       // Here NodeMailer logic would go to email authors
       // For now we just create EventAuthor records for all Active authors
       const activeAuthors = await prisma.author.findMany({ where: { status: 'Active' } });
       const eventAuthorsData = activeAuthors.map(a => ({ eventId, authorId: a.id, optInStatus: 'Pending' }));
       await prisma.eventAuthor.createMany({ data: eventAuthorsData, skipDuplicates: true });
       
       res.json({ success: true, message: 'Broadcast sent to authors. Opt-in requests created.' });
    } else if (target === 'Customers') {
       await prisma.event.update({
         where: { id: eventId },
         data: { broadcastStatus: 'CustomersAlso' }
       });
       res.json({ success: true, message: 'Catalogue generated and broadcasted to customers!' });
    } else {
       res.status(400).json({ error: 'Invalid broadcast target' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Broadcast failed' });
  }
});

// --- POS APIs ---

app.get('/api/author/events/:eventId/pos-inventory', verifyToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(404).json({ error: 'Author not found' });

    const eventBooks = await prisma.eventBook.findMany({
      where: { eventId, authorId: author.id },
      include: { book: true }
    });

    res.json({ author, eventBooks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch POS inventory' });
  }
});

app.post('/api/author/events/:eventId/pos-checkout', verifyToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { cart, paymentMethod, totalAmount } = req.body;
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(404).json({ error: 'Author not found' });

    // Ensure they have enough stock
    for (const item of cart) {
       const eb = await prisma.eventBook.findFirst({ where: { eventId, authorId: author.id, bookId: item.bookId } });
       if (!eb) return res.status(400).json({ error: `Book ${item.bookId} not registered for this event` });
       if ((eb.listedStock - eb.soldStock) < item.quantity) {
          return res.status(400).json({ error: `Insufficient stock for book ID ${item.bookId}` });
       }
    }

    // Create PosOrder
    const posOrder = await prisma.posOrder.create({
      data: {
        authorId: author.id,
        eventId,
        totalAmount: parseFloat(totalAmount),
        paymentMethod,
        paymentStatus: 'CONFIRMED',
        saleSource: 'BOOK_FAIR',
        items: {
          create: cart.map(item => ({
             bookId: item.bookId,
             quantity: item.quantity,
             price: parseFloat(item.price)
          }))
        }
      }
    });

    // Increment soldStock
    for (const item of cart) {
       const eb = await prisma.eventBook.findFirst({ where: { eventId, authorId: author.id, bookId: item.bookId } });
       if (eb) {
          await prisma.eventBook.update({
             where: { id: eb.id },
             data: { soldStock: { increment: item.quantity } }
          });
       }
    }

    res.json({ success: true, posOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'POS checkout failed' });
  }
});

app.get('/api/author/events/:eventId/pos-sales-summary', verifyToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(404).json({ error: 'Author not found' });

    const posOrders = await prisma.posOrder.findMany({
      where: { eventId, authorId: author.id },
      include: { items: { include: { book: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const summary = posOrders.reduce((acc, order) => {
      acc.totalRevenue += order.totalAmount;
      acc.totalBooksSold += order.items.reduce((sum, item) => sum + item.quantity, 0);
      return acc;
    }, { totalRevenue: 0, totalBooksSold: 0, totalTransactions: posOrders.length });

    const eventBooks = await prisma.eventBook.findMany({
      where: { eventId, authorId: author.id },
      include: { book: true }
    });

    res.json({ summary, posOrders, eventBooks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch POS sales summary' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Trigger nodemon restart
