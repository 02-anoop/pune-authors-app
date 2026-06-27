const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { getCache, setCache, invalidateCache } = require('../utils/cache');
const { isAdmin, verifyToken } = require('../middleware/auth');
const { sendNotificationEmail, emailWrap } = require('../utils/email');
const { upload } = require('../config/upload');

// --- FORMS MANAGEMENT ---

// Admin: Get all form templates
router.get('/api/admin/forms', verifyToken, isAdmin, async (req, res) => {
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
router.post('/api/admin/forms', verifyToken, isAdmin, async (req, res) => {
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
router.delete('/api/admin/forms/:id', verifyToken, isAdmin, async (req, res) => {
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
router.get('/api/admin/forms/:id/responses', verifyToken, isAdmin, async (req, res) => {
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
router.get('/api/author/forms', verifyToken, async (req, res) => {
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
router.post('/api/author/forms/:id/submit', verifyToken, async (req, res) => {
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



module.exports = router;
