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
    const queryToUpdate = await prisma.query.findUnique({ where: { id } });
    const updatedReply = queryToUpdate.reply ? `${queryToUpdate.reply}\n\n---\n\nAdmin: ${reply}` : `Admin: ${reply}`;
    
    const query = await prisma.query.update({
      where: { id },
      data: {
        reply: updatedReply,
        status: 'Answered'
      },
      include: { user: true }
    });
    
    if (query.user && query.user.email) {
      await sendNotificationEmail(query.user.email, 'Support Query Update', `Admin has replied to your query:\n\nSubject: ${query.subject}\nReply: ${reply}`);
    }
    
    res.json(query);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reply to query' });
  }
});

// Admin: Resolve a query
router.put('/api/admin/queries/:id/resolve', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const query = await prisma.query.update({
      where: { id },
      data: { status: 'Resolved' },
      include: { user: true }
    });
    
    if (query.user && query.user.email) {
      await sendNotificationEmail(query.user.email, 'Support Query Resolved', `Your support query has been marked as resolved:\n\nSubject: ${query.subject}`);
    }
    
    res.json(query);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to resolve query' });
  }
});

// Author: Reply to a query
router.put('/api/author/queries/:id/reply', verifyToken, async (req, res) => {
  try {
    const { reply } = req.body;
    const id = parseInt(req.params.id);
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });
    
    const query = await prisma.query.findUnique({ where: { id } });
    if (query.authorId !== author.id) return res.status(403).json({ error: 'Not authorized for this query' });
    
    const queryToUpdate = await prisma.query.findUnique({ where: { id } });
    const updatedReply = queryToUpdate.reply ? `${queryToUpdate.reply}\n\n---\n\nAuthor (${author.name}): ${reply}` : `Author (${author.name}): ${reply}`;
    
    const updatedQuery = await prisma.query.update({
      where: { id },
      data: {
        reply: updatedReply,
        status: 'Answered'
      },
      include: { user: true }
    });
    
    if (updatedQuery.user && updatedQuery.user.email) {
      await sendNotificationEmail(updatedQuery.user.email, 'Author Replied to Your Query', `${author.name} has replied to your query:\n\nSubject: ${updatedQuery.subject}\nReply: ${reply}`);
    }
    
    res.json(updatedQuery);
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
    const { subject, message, authorId } = req.body;
    const user = await prisma.user.findUnique({ where: { email: req.user.email } });
    if (!user) return res.status(404).json({ error: 'Not found' });
    const query = await prisma.query.create({
      data: {
        userId: user.id,
        authorId: authorId ? parseInt(authorId) : null,
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

// Customer: Reply to a query
router.put('/api/customer/queries/:id/reply', verifyToken, async (req, res) => {
  try {
    const { reply } = req.body;
    const id = parseInt(req.params.id);
    const user = await prisma.user.findUnique({ where: { email: req.user.email } });
    if (!user) return res.status(404).json({ error: 'Not found' });
    
    const query = await prisma.query.findUnique({ where: { id } });
    if (query.userId !== user.id) return res.status(403).json({ error: 'Not authorized for this query' });
    
    const updatedReply = query.reply ? `${query.reply}\n\n---\n\nCustomer: ${reply}` : `Customer: ${reply}`;
    
    const updatedQuery = await prisma.query.update({
      where: { id },
      data: {
        reply: updatedReply,
        status: 'Pending'
      }
    });
    
    res.json(updatedQuery);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reply to query' });
  }
});

// Admin: Delete a query
router.delete('/api/admin/queries/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.query.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete query' });
  }
});

module.exports = router;
