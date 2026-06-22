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
            include: { book: true }
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
    const { name, email, phone, password, bio, title, genre, synopsis, pages, mrp } = req.body;
    
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
        bio,
        photoUrl,
        books: {
          create: {
            title,
            genre,
            synopsis,
            pages: parseInt(pages) || null,
            mrp: parseFloat(mrp),
            coverUrl
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
  const authors = await prisma.author.findMany({
    include: { books: true }
  });
  res.json(authors);
});

// 5. Operations Dashboard - Approve Author
app.post('/api/admin/authors/:id/approve', async (req, res) => {
  const id = parseInt(req.params.id);
  const author = await prisma.author.update({
    where: { id },
    data: { status: 'Approved' }
  });
  // Approve their books too
  await prisma.book.updateMany({
    where: { authorId: id },
    data: { status: 'Approved' }
  });
  res.json(author);
});

// 6. Checkout - Create Order
app.post('/api/orders', verifyToken, upload.single('paymentScreenshot'), async (req, res) => {
  try {
    const { customerName, customerPhone, address, amount, items } = req.body;
    const paymentScreenshot = req.file ? `/uploads/${req.file.filename}` : null;
    const parsedItems = JSON.parse(items);
    
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
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.put('/api/order-items/:id/status', async (req, res) => {
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

// --- EVENT RSVP ---
app.post('/api/events/rsvp', verifyToken, async (req, res) => {
  try {
    const { eventTitle, eventDate } = req.body;
    if (!eventTitle || !eventDate) {
      return res.status(400).json({ error: 'Event title and date are required' });
    }

    const userId = req.user.userId;

    // Check if already RSVP'd
    const existing = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventTitle: {
          userId,
          eventTitle
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'You have already registered for this event' });
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventTitle,
        eventDate,
        userId
      }
    });

    res.status(201).json(registration);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register for event' });
  }
});

app.get('/api/events/my-registrations', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const registrations = await prisma.eventRegistration.findMany({
      where: { userId }
    });
    res.json(registrations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
