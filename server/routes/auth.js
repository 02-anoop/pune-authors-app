const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');
const { upload } = require('../config/upload');

// Replace /api/auth/ prefix with / since we will mount on /api/auth
// --- AUTHENTICATION ---



router.post('/register', async (req, res) => {
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

router.post('/login', async (req, res) => {
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


router.get('/me', verifyToken, async (req, res) => {
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

router.put('/profile', verifyToken, async (req, res) => {
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


module.exports = router;
