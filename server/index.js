require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

    if (user.role === 'AUTHOR') {
      const author = await prisma.author.findUnique({ where: { email } });
      if (author && author.status === 'Pending') {
        return res.status(403).json({ error: 'Approval Pending. You can login after the admin approves your account.' });
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
  const where = { status: 'Approved' };
  if (genre) where.genre = genre;

  const books = await prisma.book.findMany({
    where,
    include: { author: true }
  });
  res.json(books);
});

// 2. Author Registration (creates author, user login, and their first book)
app.post('/api/authors/register', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, email, phone, password, bio, title, genre, synopsis, pages, mrp, whatsapp } = req.body;
    
    // Check if email already in use
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // In local dev, store local URL. In prod, this would be an S3 URL.
    const photoUrl = req.files['photo'] ? `/uploads/${req.files['photo'][0].filename}` : null;
    const coverUrl = req.files['cover'] ? `/uploads/${req.files['cover'][0].filename}` : null;

    // Create login user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'AUTHOR' }
    });

    const author = await prisma.author.create({
      data: {
        name,
        email,
        phone,
        whatsapp,
        bio,
        photoUrl,
        books: {
          create: {
            title,
            genre,
            synopsis,
            pages: parseInt(pages) || null,
            mrp: parseFloat(mrp),
            coverUrl,
            status: 'Approved'
          }
        }
      },
      include: { books: true }
    });

    res.status(201).json(author);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
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
app.get('/api/admin/authors', async (req, res) => {
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
app.delete('/api/admin/authors/:id', async (req, res) => {
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
app.post('/api/admin/authors/:id/approve', async (req, res) => {
  const id = parseInt(req.params.id);
  const author = await prisma.author.update({
    where: { id },
    data: { status: 'Active' }
  });
  // Approve their books too
  await prisma.book.updateMany({
    where: { authorId: id },
    data: { status: 'Approved' }
  });
  res.json(author);
});

// Admin Dashboard Overview Stats
app.get('/api/admin/dashboard-stats', async (req, res) => {
  try {
    const totalAuthors = await prisma.author.count();
    const totalBooks = await prisma.book.count();
    const eventParticipations = await prisma.eventRegistration.count();
    
    const orders = await prisma.order.findMany({
      where: { status: { in: ['Completed', 'Delivered', 'Shipped', 'Dispatched'] } },
      orderBy: { createdAt: 'asc' }
    });
    const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);

    // Revenue Data Generation
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueDataMap = {};
    
    // Initialize last 6 months
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

    // Recent Activities
    const recentAuthors = await prisma.author.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
    const recentOrders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
    const recentEvents = await prisma.eventRegistration.findMany({ include: { author: true, activity: true }, orderBy: { createdAt: 'desc' }, take: 5 });
    
    const activities = [];
    recentAuthors.forEach(a => activities.push({
      id: `auth-${a.id}`,
      action: 'New Author Registration',
      subject: a.name,
      createdAt: a.createdAt,
      type: 'author'
    }));
    recentOrders.forEach(o => activities.push({
      id: `ord-${o.id}`,
      action: 'Order Received',
      subject: `INR ${o.amount} from ${o.customerName}`,
      createdAt: o.createdAt,
      type: 'order'
    }));
    recentEvents.forEach(e => activities.push({
      id: `evt-${e.id}`,
      action: 'Event RSVP',
      subject: `${e.author?.name || 'Author'} joined ${e.activity?.name || 'Event'}`,
      createdAt: e.createdAt,
      type: 'event'
    }));

    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentActivities = activities.slice(0, 8);

    res.json({ totalAuthors, totalBooks, eventParticipations, totalRevenue, revenueData, recentActivities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

// Admin Books
app.get('/api/admin/books', async (req, res) => {
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

app.delete('/api/admin/books/:id', async (req, res) => {
  try {
    await prisma.book.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Admin Activities
app.get('/api/admin/activities', async (req, res) => {
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

app.post('/api/admin/activities', async (req, res) => {
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
app.get('/api/admin/authors/:id/dashboard-data', async (req, res) => {
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

// Get Author Dashboard Data
app.get('/api/author/dashboard-data', verifyToken, async (req, res) => {
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

// Add New Book by Existing Author
app.post('/api/author/books', verifyToken, upload.single('cover'), async (req, res) => {
  try {
    const { title, genre, synopsis, pages, mrp, stock, overpriced } = req.body;
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });

    const coverUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newBook = await prisma.book.create({
      data: {
        title,
        genre,
        synopsis,
        pages: parseInt(pages) || null,
        mrp: parseFloat(mrp),
        stock: parseInt(stock) || 0,
        overpriced: overpriced === 'true',
        coverUrl,
        authorId: author.id,
        status: 'Approved'
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
app.post('/api/orders', verifyToken, upload.single('paymentScreenshot'), async (req, res) => {
  try {
    const { customerName, customerPhone, address, amount, items } = req.body;
    const parsedItems = Array.isArray(items) ? items : JSON.parse(items);
    
    const paymentScreenshot = req.file ? `/uploads/${req.file.filename}` : null;

    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail: req.user.email,
        customerPhone,
        address,
        amount: parseFloat(amount),
        paymentScreenshot,
        items: {
          create: parsedItems.map(item => ({
            bookId: parseInt(item.bookId),
            quantity: parseInt(item.quantity)
          }))
        }
      },
      include: { items: true }
    });

    console.log(`[EMAIL MOCK] Sent order confirmation to ${req.user.email}`);

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Order failed' });
  }
});

// 7. Operations/Author Dashboard - Get all orders
app.get('/api/admin/orders', async (req, res) => {
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
      items: ord.items.map(i => ({ title: i.book.title, qty: i.quantity, authorName: i.book.author.name })),
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

app.put('/api/admin/orders/:id/status', async (req, res) => {
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

app.put('/api/order-items/:id/accept', verifyToken, async (req, res) => {
  try {
    const orderItem = await prisma.orderItem.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'Accepted' }
    });
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
      data: { status: 'Dispatched', trackingNumber }
    });
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
      data: { status: 'Completed' }
    });
    res.json(orderItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to acknowledge order' });
  }
});

// 8. Operations Dashboard - Verify Order
app.post('/api/admin/orders/:id/verify', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = await prisma.order.update({
      where: { id },
      data: { status: 'Completed' }
    });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to verify order' });
  }
});

app.post('/api/admin/orders/:id/reject-payment', async (req, res) => {
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
      orderBy: { date: 'desc' }
    });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch gallery events' });
  }
});

app.post('/api/admin/gallery', upload.single('photo'), async (req, res) => {
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
app.put('/api/admin/gallery/:id', upload.single('photo'), async (req, res) => {
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

app.delete('/api/admin/gallery/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.galleryEvent.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete gallery event' });
  }
});

// --- FORMS MANAGEMENT ---

// Admin: Get all form templates
app.get('/api/admin/forms', verifyToken, async (req, res) => {
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
app.post('/api/admin/forms', verifyToken, async (req, res) => {
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
app.delete('/api/admin/forms/:id', verifyToken, async (req, res) => {
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
app.get('/api/admin/forms/:id/responses', verifyToken, async (req, res) => {
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
