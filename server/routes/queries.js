const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { getCache, setCache, invalidateCache } = require('../utils/cache');
const { isAdmin, verifyToken } = require('../middleware/auth');
const { sendNotificationEmail, emailWrap } = require('../utils/email');
const { upload } = require('../config/upload');

// --- QUERIES (SUPPORT) ---

// Author: Get their own queries
router.get('/api/author/queries', verifyToken, async (req, res) => {
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
router.post('/api/author/queries', verifyToken, async (req, res) => {
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
router.get('/api/admin/queries', verifyToken, isAdmin, async (req, res) => {
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
router.put('/api/admin/queries/:id/reply', verifyToken, isAdmin, async (req, res) => {
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
router.get('/api/customer/queries', verifyToken, async (req, res) => {
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
router.post('/api/customer/queries', verifyToken, async (req, res) => {
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

module.exports = router;
