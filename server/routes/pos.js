const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { getCache, setCache, invalidateCache } = require('../utils/cache');
const { isAdmin, verifyToken } = require('../middleware/auth');
const { sendNotificationEmail, emailWrap } = require('../utils/email');
const { upload } = require('../config/upload');

// --- POS APIs ---



router.post('/api/author/events/:eventId/add-stock', verifyToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { bookId, quantity } = req.body;
    
    if (!bookId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid book or quantity' });
    }

    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(404).json({ error: 'Author not found' });

    // Ensure the book exists and belongs to the author
    const book = await prisma.book.findFirst({ where: { id: parseInt(bookId), authorId: author.id } });
    if (!book) return res.status(404).json({ error: 'Book not found' });

    // Check if the author has enough stock in main inventory
    if (book.stock < quantity) {
      return res.status(400).json({ error: 'Not enough stock in your main inventory to add to this event.' });
    }

    // Find the event book
    const eventBook = await prisma.eventBook.findFirst({ where: { eventId, authorId: author.id, bookId: parseInt(bookId) } });
    if (!eventBook) return res.status(404).json({ error: 'Book is not registered for this event.' });

    // Use a transaction to deduct from main inventory and add to event inventory
    await prisma.$transaction([
      prisma.book.update({
        where: { id: book.id },
        data: { stock: { decrement: parseInt(quantity) } }
      }),
      prisma.eventBook.update({
        where: { id: eventBook.id },
        data: { listedStock: { increment: parseInt(quantity) } }
      })
    ]);

    // invalidate author cache since main inventory changed
    invalidateCache(`authorDashboardData_${author.id}`);

    res.json({ success: true, message: 'Stock added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add stock' });
  }
});

router.get('/api/author/events/:eventId/pos-inventory', verifyToken, async (req, res) => {
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

router.post('/api/author/events/:eventId/pos-checkout', verifyToken, async (req, res) => {
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

router.get('/api/author/events/:eventId/pos-sales-summary', verifyToken, async (req, res) => {
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



module.exports = router;
