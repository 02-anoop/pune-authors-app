const { validate } = require('../middleware/validate');
const { eventSchema } = require('../validators');
const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const bcrypt = require('bcrypt');
const { getCache, setCache, invalidateCache } = require('../utils/cache');
const { isAdmin, verifyToken, optionalVerifyToken } = require('../middleware/auth');
const { sendNotificationEmail, emailWrap } = require('../utils/email');
const { upload } = require('../config/upload');
const { inr } = require('../utils/helpers');
const path = require('path');
const fs = require('fs');

// --- BOOKS & AUTHORS ---

// --- PUBLIC CONTACT INQUIRY ---
router.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });
    
    // Save to DB
    const inquiry = await prisma.contactInquiry.create({
      data: { name, email, message }
    });
    
    // Also create a Query so it appears in the Admin Helpdesk
    await prisma.query.create({
      data: {
        subject: `Contact Form: ${name}`,
        message: `From: ${email}\n\n${message}`,
        status: 'Pending'
      }
    });
    
    res.status(201).json(inquiry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit' });
  }
});

// 1. Get all approved books for catalogue
router.get('/api/books', async (req, res) => {
  const { genre } = req.query;
  const cacheKey = `books:${genre || 'all'}`;
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  const where = { status: 'Approved' };
  if (genre) where.genre = genre;

  const books = await prisma.book.findMany({
    where,
    include: { author: true, reviews: { select: { rating: true } } }
  });

  const filteredBooks = books.filter(b => {
    if (!b.author || b.author.status === 'Rejected') return false;
    const extraData = b.author?.extraData;
    if (extraData && extraData.lateFines > 0 && extraData.fineDate) {
      const diffDays = (new Date().getTime() - new Date(extraData.fineDate).getTime()) / (1000 * 3600 * 24);
      if (diffDays > 3) return false;
    }
    return true;
  });

  setCache(cacheKey, filteredBooks, 60 * 1000); // 60s cache
  res.json(filteredBooks);
});

// 1a(i). Get public landing page stats
router.get('/api/public-stats', async (req, res) => {
  const cached = getCache('public-stats');
  if (cached) return res.json(cached);
  try {
    const authors = await prisma.author.count({ where: { status: 'Approved' } });
    const books = await prisma.book.count({ where: { status: 'Approved' } });
    const genres = await prisma.book.findMany({ select: { genre: true }, distinct: ['genre'], where: { status: 'Approved' } });
    const categories = genres.filter(g => g.genre).length;
    
    const events = await prisma.event.count();
    const libraries = await prisma.library.count();
    
    // For fairs, if we don't have a specific tag, we can just use 3 or derive it.
    const fairs = 3; 
    
    const stats = { authors: authors || 100, books: books || 350, categories: categories || 50, events: events || 12, fairs: fairs, airportLibraries: libraries || 6 };
    setCache('public-stats', stats, 5 * 60 * 1000); // 5 mins
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch public stats' });
  }
});


// 1b. Get single book by ID (with author + reviews)
router.get('/api/books/:id', async (req, res) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        author: true,
        reviews: { orderBy: { createdAt: 'desc' } }
      }
    });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    
    const extraData = book.author?.extraData;
    if (extraData && extraData.lateFines > 0 && extraData.fineDate) {
      const diffDays = (new Date().getTime() - new Date(extraData.fineDate).getTime()) / (1000 * 3600 * 24);
      if (diffDays > 3) return res.status(403).json({ error: 'Book is temporarily suspended' });
    }

    res.json(book);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// Get reviews for a book
router.get('/api/books/:id/reviews', async (req, res) => {
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
router.post('/api/books/:id/reviews', async (req, res) => {
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
router.post('/api/authors/register', upload.any(), async (req, res) => {
  try {
    const { 
      name, email, phone, whatsapp, password, bio, penName, city, state, instagram, facebook, linkedin, youtube, 
      qualification, qualifications, institution, subject, dob, experience, skills, hobbies, whyJoining, aadharNumber, address, district, pincode, extraData, transactionId, conflictOfInterestSignature, agreedToGuidelines, agreedToInfoDoc
    } = req.body;
    
    // Check if email already in use by an actual Author profile
    const existingAuthor = await prisma.author.findUnique({ where: { email } });
    if (existingAuthor) {
      return res.status(400).json({ error: 'Email already registered as an Author' });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });

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

    let qualificationsArray = [];
    if (qualifications) {
       try { qualificationsArray = JSON.parse(qualifications); } catch(e) {}
    } else if (qualification) {
       qualificationsArray.push({ qualification, institution, subject });
    }

    let photoUrl = null, paymentScreenshotUrl = null, qrCodeUrl = null, certificateUrl = null;
    let covers = {};
    let backCovers = {};
    if (Array.isArray(req.files)) {
       for (const file of req.files) {
          if (file.fieldname === 'photo') photoUrl = `/uploads/${file.filename}`;
          if (file.fieldname === 'paymentScreenshot') paymentScreenshotUrl = `/uploads/${file.filename}`;
          if (file.fieldname === 'qrCode') qrCodeUrl = `/uploads/${file.filename}`;
          if (file.fieldname === 'certificate') certificateUrl = `/uploads/${file.filename}`;
          if (file.fieldname === 'cover') covers[0] = `/uploads/${file.filename}`;
          if (file.fieldname === 'backCover') backCovers[0] = `/uploads/${file.filename}`;
          if (file.fieldname.startsWith('cover_')) {
             const idx = file.fieldname.split('_')[1];
             covers[idx] = `/uploads/${file.filename}`;
          }
          if (file.fieldname.startsWith('backCover_')) {
             const idx = file.fieldname.split('_')[1];
             backCovers[idx] = `/uploads/${file.filename}`;
          }
          if (file.fieldname.startsWith('certificate_')) {
             const id = file.fieldname.split('_')[1];
             const q = qualificationsArray.find(q => q.id == id);
             if (q) q.certificateUrl = `/uploads/${file.filename}`;
          }
       }
    }
    
    // Fallback logic for backward compatibility
    if (certificateUrl && qualificationsArray.length > 0 && !qualificationsArray[0].certificateUrl) {
       qualificationsArray[0].certificateUrl = certificateUrl;
    }
    
    const finalQualificationString = JSON.stringify(qualificationsArray);
    
    // Explicitly validate payment requirements
    if (!paymentScreenshotUrl || !transactionId) {
      return res.status(400).json({ error: 'Payment screenshot and Transaction ID are mandatory for registration.' });
    }

    // Explicitly validate mandatory file uploads (cover, backCover, certificate)
    if (!covers[0]) {
      return res.status(400).json({ error: 'Book Front Cover is mandatory.' });
    }
    if (!backCovers[0]) {
      return res.status(400).json({ error: 'Book Back Cover is mandatory.' });
    }
    if (!qualificationsArray[0]?.certificateUrl) {
      return res.status(400).json({ error: 'Qualification Certificate is mandatory.' });
    }

    // Handle login user
    let user = existingUser;
    let finalHashedPassword;
    if (!existingUser) {
      if (!password) {
         return res.status(400).json({ error: 'Password is required for new registration' });
      }
      finalHashedPassword = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: { name, email, password: finalHashedPassword, role: 'AUTHOR', address }
      });
    } else {
      finalHashedPassword = existingUser.password;
      await prisma.user.update({
        where: { email },
        data: { name, address, role: 'AUTHOR' }
      });
    }

    let author;
    try {
      author = await prisma.author.create({
      data: {
        name: name || "NA",
        email: email || "NA",
        phone: phone || "NA",
        bio: bio || "NA",
        penName: penName || "NA",
        city: city || "NA",
        state: state || "NA",
        instagram: instagram || "",
        facebook: facebook || "",
        photoUrl: photoUrl || "",
        qrCodeUrl: qrCodeUrl || "",
        transactionId: transactionId || "NA",
        paymentScreenshot: paymentScreenshotUrl || "",
        qualification: finalQualificationString,
        institution: "NA",
        subject: "NA",
        certificateUrl: "",
        age: dob || "NA",
        experience: experience || "0",
        skills: skills || "NA",
        hobbies: hobbies || "NA",
        whyJoining: whyJoining || "NA",
        aadharNumber: aadharNumber || "NA",
        address: address || "NA",
        district: district || "NA",
        pincode: pincode || "000000",
        dob: dob || "NA",
        skillsJson: (() => { try { return JSON.parse(skills) } catch(e) { return [] } })(),
        hobbiesJson: (() => { try { return JSON.parse(hobbies) } catch(e) { return [] } })(),
        qualificationsJson: qualificationsArray,
        extraData: (() => {
          let parsed = extraData ? JSON.parse(extraData) : {};
          parsed.linkedin = linkedin || "";
          parsed.youtube = youtube || "";
          parsed.conflictOfInterestSignature = conflictOfInterestSignature || "NA";
          if (agreedToGuidelines !== undefined) parsed.agreedToGuidelines = agreedToGuidelines === 'true' || agreedToGuidelines === true;
          if (agreedToInfoDoc !== undefined) parsed.agreedToInfoDoc = agreedToInfoDoc === 'true' || agreedToInfoDoc === true;
          return parsed;
        })(),
        books: {
          create: booksArray.map((b, idx) => ({
            title: b.title || "NA",
            subtitle: b.subtitle || "NA",
            genre: b.genre || "NA",
            subGenre: b.subGenre || "NA",
            synopsis: b.synopsis || "NA",
            pages: parseInt(b.pages) || 0,
            mrp: parseFloat(b.mrp) || 0,
            stock: parseInt(b.stock) || 0,
            language: b.language || "NA",
            isbn: b.isbn || "0000000000000",
            publisher: b.publisher || "NA",
            publicationDate: b.publicationDate || "NA",
            edition: b.edition || "1",
            format: b.format || "NA",
            printFormat: b.printFormat || "NA",
            purpose: b.purpose || "NA",
            coverUrl: covers[idx] || "",
            backCoverUrl: backCovers[idx] || "",
            status: 'Pending'
          }))
        }
      },
      include: { books: true }
    });
    } catch (dbError) {
      // Rollback user if author fails AND user was just created
      if (!existingUser) {
        await prisma.user.delete({ where: { email } });
      }
      throw dbError;
    }

    invalidateCache('books');
    
    if (typeof sendNotificationEmail === 'function' && typeof emailWrap === 'function') {
      const emailContent = `
        <p>Dear ${author.name},</p>
        <p>Thank you for registering with the Pune Authors' Association.</p>
        <p>Your profile has been created and is currently under admin review.</p>
        <p>You will receive another email once your application is approved or rejected.</p>
        <p>Dashboard access will be available only after your application has been approved.</p>
      `;
      sendNotificationEmail(author.email, "Registration Received - PAA", emailWrap("Registration Received", emailContent));
    }

    res.status(201).json(author);
  } catch (error) {
    console.error(error);
    require('fs').writeFileSync('last_error.log', error.stack || error.toString());
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Full re-application endpoint
// Author: Edit Profile (Full)
router.put('/api/author/edit-profile-full', verifyToken, upload.any(), async (req, res) => {
  try {
    const author = await prisma.author.findUnique({ where: { email: req.user.email }, include: { books: true } });
    if (!author) return res.status(404).json({ error: 'Author not found' });

    let currentExtraData = author.extraData || {};
    if (typeof currentExtraData === 'string') {
        try { currentExtraData = JSON.parse(currentExtraData); } catch(e) { currentExtraData = {}; }
    }
    
    // We snapshot the entire author record so admin can diff it!
    if (!currentExtraData.hasPendingEdits) {
        const { extraData: _extraData, ...authorWithoutExtra } = author;
        currentExtraData.originalProfileData = authorWithoutExtra;
    }
    currentExtraData.hasPendingEdits = true;

    const { 
      name, phone, whatsapp, bio, penName, city, state, instagram, facebook, linkedin, youtube, 
      qualification, qualifications, institution, subject, dob, experience, skills, hobbies, whyJoining, aadharNumber, address, district, pincode, extraData, transactionId, conflictOfInterestSignature, agreedToGuidelines, agreedToInfoDoc
    } = req.body;

    let booksArray = [];
    if (req.body.books) {
      try { booksArray = JSON.parse(req.body.books); } catch(e) {}
    }
    if (booksArray.length === 0 && req.body.title) {
       booksArray.push({
         title: req.body.title, subtitle: req.body.subtitle, genre: req.body.genre, subGenre: req.body.subGenre,
         synopsis: req.body.synopsis, pages: req.body.pages, mrp: req.body.mrp, stock: req.body.stock,
         language: req.body.language, isbn: req.body.isbn, publisher: req.body.publisher,
         publicationDate: req.body.publicationDate, edition: req.body.edition, format: req.body.format, purpose: req.body.purposeOfWriting, printFormat: req.body.printFormat
       });
    }

    let qualificationsArray = [];
    if (qualifications) {
       try { qualificationsArray = JSON.parse(qualifications); } catch(e) {}
    } else if (qualification) {
       qualificationsArray.push({ qualification, institution, subject });
    }

    let photoUrl = author.photoUrl, paymentScreenshotUrl = author.paymentScreenshot, qrCodeUrl = author.qrCodeUrl;
    let covers = {};
    let backCovers = {};
    
    let existingQuals = [];
    try { existingQuals = JSON.parse(author.qualification || '[]'); } catch(e) {}
    qualificationsArray.forEach(q => {
       const eq = existingQuals.find(ex => ex.id === q.id);
       if (eq && eq.certificateUrl) q.certificateUrl = eq.certificateUrl;
    });

    if (Array.isArray(req.files)) {
       for (const file of req.files) {
          if (file.fieldname === 'photo') photoUrl = `/uploads/${file.filename}`;
          if (file.fieldname === 'paymentScreenshot') paymentScreenshotUrl = `/uploads/${file.filename}`;
          if (file.fieldname === 'qrCode') qrCodeUrl = `/uploads/${file.filename}`;
          if (file.fieldname.startsWith('cover_')) {
             const idx = file.fieldname.split('_')[1];
             covers[idx] = `/uploads/${file.filename}`;
          }
          if (file.fieldname.startsWith('backCover_')) {
             const idx = file.fieldname.split('_')[1];
             backCovers[idx] = `/uploads/${file.filename}`;
          }
          if (file.fieldname.startsWith('certificate_')) {
             const id = file.fieldname.split('_')[1];
             const q = qualificationsArray.find(q => q.id == id);
             if (q) q.certificateUrl = `/uploads/${file.filename}`;
          }
       }
    }
    
    const finalQualificationString = JSON.stringify(qualificationsArray);

    if (extraData) {
        let incomingExtra = JSON.parse(extraData);
        currentExtraData = { ...currentExtraData, ...incomingExtra, hasPendingEdits: true, originalProfileData: currentExtraData.originalProfileData };
    }
    
    if (linkedin) currentExtraData.linkedin = linkedin;
    if (youtube) currentExtraData.youtube = youtube;
    if (conflictOfInterestSignature) currentExtraData.conflictOfInterestSignature = conflictOfInterestSignature;
    if (agreedToGuidelines !== undefined) currentExtraData.agreedToGuidelines = agreedToGuidelines === 'true' || agreedToGuidelines === true;
    if (agreedToInfoDoc !== undefined) currentExtraData.agreedToInfoDoc = agreedToInfoDoc === 'true' || agreedToInfoDoc === true;

    await prisma.author.update({
      where: { id: author.id },
      data: {
        name, phone, bio, penName, city, state, instagram, facebook,
        photoUrl, qrCodeUrl, transactionId, paymentScreenshot: paymentScreenshotUrl,
        qualification: finalQualificationString,
        age: dob, experience, skills, hobbies, whyJoining, aadharNumber, address, district, pincode, dob, skillsJson: (() => { try { return JSON.parse(skills) } catch(e) { return [] } })(), hobbiesJson: (() => { try { return JSON.parse(hobbies) } catch(e) { return [] } })(), qualificationsJson: qualificationsArray, 
        status: 'Edited',
        extraData: currentExtraData
      }
    });

    const incomingBookIds = booksArray.map(b => parseInt(b.id)).filter(id => !isNaN(id));
    await prisma.book.deleteMany({
       where: { authorId: author.id, id: { notIn: incomingBookIds } }
    });

    for (let i = 0; i < booksArray.length; i++) {
       const b = booksArray[i];
       const bId = parseInt(b.id);
       const existingBook = !isNaN(bId) ? author.books.find(eb => eb.id === bId) : null;
       const bookData = {
         title: b.title, subtitle: b.subtitle, genre: b.genre, subGenre: b.subGenre,
         synopsis: b.synopsis,
         purpose: b.purpose, pages: parseInt(b.pages) || null, mrp: parseFloat(b.mrp) || 0,
         stock: parseInt(b.stock) || 0, language: b.language, isbn: b.isbn,
         publisher: b.publisher, publicationDate: b.publicationDate, edition: b.edition, format: b.format, printFormat: b.printFormat,
         status: 'Pending'
       };
       if (covers[i] || (i === 0 && covers[0])) {
          bookData.coverUrl = covers[i] || covers[0];
       }
       if (backCovers[i] || (i === 0 && backCovers[0])) {
          bookData.backCoverUrl = backCovers[i] || backCovers[0];
       }
       if (existingBook) {
          await prisma.book.update({ where: { id: existingBook.id }, data: bookData });
       } else {
          await prisma.book.create({ data: { ...bookData, authorId: author.id } });
       }
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    require('fs').writeFileSync('last_error.log', err.stack || err.toString());
    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
});

router.put('/api/author/reapply-full', verifyToken, upload.any(), async (req, res) => {
  try {
    const author = await prisma.author.findUnique({ where: { email: req.user.email }, include: { books: true } });
    if (!author) return res.status(404).json({ error: 'Author not found' });

    const { 
      name, phone, whatsapp, bio, penName, city, state, instagram, facebook, linkedin, youtube, 
      qualification, qualifications, institution, subject, dob, experience, skills, hobbies, whyJoining, aadharNumber, address, district, pincode, extraData, transactionId, conflictOfInterestSignature, agreedToGuidelines, agreedToInfoDoc
    } = req.body;

    let booksArray = [];
    if (req.body.books) {
      try { booksArray = JSON.parse(req.body.books); } catch(e) {}
    }
    if (booksArray.length === 0 && req.body.title) {
       booksArray.push({
         title: req.body.title, subtitle: req.body.subtitle, genre: req.body.genre, subGenre: req.body.subGenre,
         synopsis: req.body.synopsis, pages: req.body.pages, mrp: req.body.mrp, stock: req.body.stock,
         language: req.body.language, isbn: req.body.isbn, publisher: req.body.publisher,
         publicationDate: req.body.publicationDate, edition: req.body.edition, format: req.body.format, purpose: req.body.purposeOfWriting
       });
    }

    let qualificationsArray = [];
    if (qualifications) {
       try { qualificationsArray = JSON.parse(qualifications); } catch(e) {}
    } else if (qualification) {
       qualificationsArray.push({ qualification, institution, subject });
    }

    let photoUrl = author.photoUrl, paymentScreenshotUrl = author.paymentScreenshot, qrCodeUrl = author.qrCodeUrl;
    let covers = {};
    let backCovers = {};
    
    // Copy existing certificates
    let existingQuals = [];
    try { existingQuals = JSON.parse(author.qualification || '[]'); } catch(e) {}
    qualificationsArray.forEach(q => {
       const eq = existingQuals.find(ex => ex.id === q.id);
       if (eq && eq.certificateUrl) q.certificateUrl = eq.certificateUrl;
    });

    if (Array.isArray(req.files)) {
       for (const file of req.files) {
          if (file.fieldname === 'photo') photoUrl = `/uploads/${file.filename}`;
          if (file.fieldname === 'paymentScreenshot') paymentScreenshotUrl = `/uploads/${file.filename}`;
          if (file.fieldname === 'qrCode') qrCodeUrl = `/uploads/${file.filename}`;
          if (file.fieldname.startsWith('cover_')) {
             const idx = file.fieldname.split('_')[1];
             covers[idx] = `/uploads/${file.filename}`;
          }
          if (file.fieldname.startsWith('backCover_')) {
             const idx = file.fieldname.split('_')[1];
             backCovers[idx] = `/uploads/${file.filename}`;
          }
          if (file.fieldname.startsWith('certificate_')) {
             const id = file.fieldname.split('_')[1];
             const q = qualificationsArray.find(q => q.id == id);
             if (q) q.certificateUrl = `/uploads/${file.filename}`;
          }
       }
    }
    
    const finalQualificationString = JSON.stringify(qualificationsArray);

    await prisma.author.update({
      where: { id: author.id },
      data: {
        name, phone, bio, penName, city, state, instagram, facebook,
        photoUrl, qrCodeUrl, transactionId, paymentScreenshot: paymentScreenshotUrl,
        qualification: finalQualificationString,
        age: dob, experience, skills, hobbies, whyJoining, aadharNumber, address, district, pincode, dob, skillsJson: (() => { try { return JSON.parse(skills) } catch(e) { return [] } })(), hobbiesJson: (() => { try { return JSON.parse(hobbies) } catch(e) { return [] } })(), qualificationsJson: qualificationsArray, status: 'Pending',
        extraData: (() => {
          let parsed = extraData ? JSON.parse(extraData) : (author.extraData || {});
          if (linkedin) parsed.linkedin = linkedin;
          if (youtube) parsed.youtube = youtube;
          if (conflictOfInterestSignature) parsed.conflictOfInterestSignature = conflictOfInterestSignature;
          if (agreedToGuidelines !== undefined) parsed.agreedToGuidelines = agreedToGuidelines === 'true' || agreedToGuidelines === true;
          if (agreedToInfoDoc !== undefined) parsed.agreedToInfoDoc = agreedToInfoDoc === 'true' || agreedToInfoDoc === true;
          parsed.isReapplied = true;
          return parsed;
        })()
      }
    });

    const incomingBookIds = booksArray.map(b => parseInt(b.id)).filter(id => !isNaN(id));
    await prisma.book.deleteMany({
       where: { authorId: author.id, id: { notIn: incomingBookIds } }
    });

    for (let i = 0; i < booksArray.length; i++) {
       const b = booksArray[i];
       const bId = parseInt(b.id);
       const existingBook = !isNaN(bId) ? author.books.find(eb => eb.id === bId) : null;
       const bookData = {
         title: b.title, subtitle: b.subtitle, genre: b.genre, subGenre: b.subGenre,
         synopsis: b.synopsis,
         purpose: b.purpose, pages: parseInt(b.pages) || null, mrp: parseFloat(b.mrp) || 0,
         stock: parseInt(b.stock) || 0, language: b.language, isbn: b.isbn,
         publisher: b.publisher, publicationDate: b.publicationDate, edition: b.edition, format: b.format, printFormat: b.printFormat,
         status: 'Pending'
       };
       if (covers[i] || (i === 0 && covers[0])) {
          bookData.coverUrl = covers[i] || covers[0];
       }
       if (backCovers[i] || (i === 0 && backCovers[0])) {
          bookData.backCoverUrl = backCovers[i] || backCovers[0];
       }
       if (existingBook) {
          await prisma.book.update({ where: { id: existingBook.id }, data: bookData });
       } else {
          await prisma.book.create({ data: { ...bookData, authorId: author.id } });
       }
    }

    if (typeof sendNotificationEmail === 'function' && typeof emailWrap === 'function') {
      const emailContent = `
        <p>Dear ${author.name || name},</p>
        <p>We have received your updated application with the Pune Authors' Association.</p>
        <p>Your profile is now <strong>under review</strong> by our editorial team. We aim to process all applications within <strong>5–7 working days</strong>.</p>
        <p>We hope to be able to approve your application this time. If you have any questions in the meantime, feel free to reach out to us.</p>
        <p style="margin-top:16px;">Warm regards,<br/>Pune Authors' Association</p>
      `;
      sendNotificationEmail(author.email, "Reapplication Received – PAA", emailWrap("Reapplication Received", emailContent));
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Reapplication failed', details: error.message });
  }
});

// 3. Get Author Dashboard details (mocking auth by just email query for now)
router.get('/api/authors/:email', async (req, res) => {
  const author = await prisma.author.findUnique({
    where: { email: req.params.email },
    include: { books: true }
  });
  if (!author) return res.status(404).json({ error: 'Author not found' });
  res.json(author);
});

// 4. Operations Dashboard - Get all authors
router.get('/api/admin/authors', verifyToken, isAdmin, async (req, res) => {
  try {
    const authors = await prisma.author.findMany({
      include: { books: { include: { reviews: true } }, eventRegistrations: true, eventAuthors: true }
    });
    const mapped = authors.map(a => ({
      ...a,
      joined: a.createdAt.toISOString().split('T')[0],
      totalBooks: a.books.length,
      eventsPart: a.eventRegistrations.length + a.eventAuthors.length,
      eventParticipation: a.eventAuthors.map(ea => ({
        ...ea,
        status: ea.optInStatus === 'Awaiting Approval' ? 'Pending' : ea.optInStatus
      }))
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Delete Author
router.delete('/api/admin/authors/:id', verifyToken, isAdmin, async (req, res) => {
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
router.put('/api/admin/authors/:id/full-update-and-approve', verifyToken, isAdmin, upload.any(), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const author = await prisma.author.findUnique({ where: { id }, include: { books: true } });
    if (!author) return res.status(404).json({ error: 'Author not found' });

    const { 
      name, phone, whatsapp, bio, penName, city, state, instagram, facebook, linkedin, youtube, 
      qualification, qualifications, institution, subject, dob, experience, skills, hobbies, whyJoining, aadharNumber, address, district, pincode, extraData, transactionId, conflictOfInterestSignature, agreedToGuidelines, agreedToInfoDoc
    } = req.body;

    let booksArray = [];
    if (req.body.books) {
      try { booksArray = JSON.parse(req.body.books); } catch(e) {}
    }
    if (booksArray.length === 0 && req.body.title) {
       booksArray.push({
         title: req.body.title, subtitle: req.body.subtitle, genre: req.body.genre, subGenre: req.body.subGenre,
         synopsis: req.body.synopsis, pages: req.body.pages, mrp: req.body.mrp, stock: req.body.stock,
         language: req.body.language, isbn: req.body.isbn, publisher: req.body.publisher,
         publicationDate: req.body.publicationDate, edition: req.body.edition, format: req.body.format, purpose: req.body.purposeOfWriting
       });
    }

    let qualificationsArray = [];
    if (qualifications) {
       try { qualificationsArray = JSON.parse(qualifications); } catch(e) {}
    } else if (qualification) {
       qualificationsArray.push({ qualification, institution, subject });
    }

    let photoUrl = author.photoUrl, paymentScreenshotUrl = author.paymentScreenshot, qrCodeUrl = author.qrCodeUrl;
    let covers = {};
    let backCovers = {};
    
    // Copy existing certificates
    let existingQuals = [];
    try { existingQuals = JSON.parse(author.qualification || '[]'); } catch(e) {}
    qualificationsArray.forEach(q => {
       const eq = existingQuals.find(ex => ex.id === q.id);
       if (eq && eq.certificateUrl) q.certificateUrl = eq.certificateUrl;
    });

    if (Array.isArray(req.files)) {
       for (const file of req.files) {
          if (file.fieldname === 'photo') photoUrl = `/uploads/${file.filename}`;
          if (file.fieldname === 'paymentScreenshot') paymentScreenshotUrl = `/uploads/${file.filename}`;
          if (file.fieldname === 'qrCode') qrCodeUrl = `/uploads/${file.filename}`;
          if (file.fieldname.startsWith('cover_')) {
             const idx = file.fieldname.split('_')[1];
             covers[idx] = `/uploads/${file.filename}`;
          }
          if (file.fieldname.startsWith('backCover_')) {
             const idx = file.fieldname.split('_')[1];
             backCovers[idx] = `/uploads/${file.filename}`;
          }
          if (file.fieldname.startsWith('certificate_')) {
             const certId = file.fieldname.split('_')[1];
             const q = qualificationsArray.find(q => q.id == certId);
             if (q) q.certificateUrl = `/uploads/${file.filename}`;
          }
       }
    }
    
    const finalQualificationString = JSON.stringify(qualificationsArray);

    await prisma.author.update({
      where: { id },
      data: {
        name, phone, bio, penName, city, state, instagram, facebook,
        photoUrl, qrCodeUrl, transactionId, paymentScreenshot: paymentScreenshotUrl,
        qualification: finalQualificationString,
        age: dob, experience, skills, hobbies, whyJoining, aadharNumber, address, district, pincode, dob, skillsJson: (() => { try { return JSON.parse(skills) } catch(e) { return [] } })(), hobbiesJson: (() => { try { return JSON.parse(hobbies) } catch(e) { return [] } })(), qualificationsJson: qualificationsArray,
        status: 'Active',
        rejectionReason: null,
        extraData: (() => {
          let parsed = extraData ? JSON.parse(extraData) : (author.extraData || {});
          if (linkedin) parsed.linkedin = linkedin;
          if (youtube) parsed.youtube = youtube;
          if (conflictOfInterestSignature) parsed.conflictOfInterestSignature = conflictOfInterestSignature;
          if (agreedToGuidelines !== undefined) parsed.agreedToGuidelines = agreedToGuidelines === 'true' || agreedToGuidelines === true;
          if (agreedToInfoDoc !== undefined) parsed.agreedToInfoDoc = agreedToInfoDoc === 'true' || agreedToInfoDoc === true;
          parsed.hasPendingEdits = false;
          return parsed;
        })()
      }
    });

    const incomingBookIds = booksArray.map(b => parseInt(b.id)).filter(id => !isNaN(id));
    await prisma.book.deleteMany({
       where: { authorId: author.id, id: { notIn: incomingBookIds } }
    });

    for (let i = 0; i < booksArray.length; i++) {
       const b = booksArray[i];
       const bId = parseInt(b.id);
       const existingBook = !isNaN(bId) ? author.books.find(eb => eb.id === bId) : null;
       const bookData = {
         title: b.title, subtitle: b.subtitle, genre: b.genre, subGenre: b.subGenre,
         synopsis: b.synopsis,
         purpose: b.purpose, pages: parseInt(b.pages) || null, mrp: parseFloat(b.mrp) || 0,
         stock: parseInt(b.stock) || 0, language: b.language, isbn: b.isbn,
         publisher: b.publisher, publicationDate: b.publicationDate, edition: b.edition, format: b.format, printFormat: b.printFormat
       };
       if (covers[i] || (i === 0 && covers[0])) {
          bookData.coverUrl = covers[i] || covers[0];
       }
       if (backCovers[i] || (i === 0 && backCovers[0])) {
          bookData.backCoverUrl = backCovers[i] || backCovers[0];
       }
       if (existingBook) {
          await prisma.book.update({ where: { id: existingBook.id }, data: { ...bookData, status: 'Approved' } });
       } else {
          await prisma.book.create({ data: { ...bookData, authorId: author.id, status: 'Approved' } });
       }
    }

    // Send approval email
    const wasEditing = author.status === 'Edited' || (author.extraData && author.extraData.hasPendingEdits);
    const emailContent = wasEditing ? `
      <p>Dear ${author.name},</p>
      <p>Your recent profile updates have been officially <strong>approved</strong> by the Pune Authors' Association editorial team.</p>
      <p>Your updated information is now live on the platform.</p>
    ` : `
      <p>Dear ${author.name},</p>
      <p>Congratulations! Your author profile has been officially approved by the Pune Authors' Association editorial team.</p>
      <p>Your books are now live in the catalogue. You can log in to your dashboard to manage your inventory, track orders, and participate in upcoming events.</p>
      <p>Welcome to the community!</p>
    `;
    if (typeof sendNotificationEmail === 'function' && typeof emailWrap === 'function') {
      sendNotificationEmail(author.email, wasEditing ? "PAA Profile Updates Approved!" : "Welcome to PAA - Your Profile is Approved!", emailWrap(wasEditing ? "Updates Approved" : "Profile Approved", emailContent));
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Approve and update failed', details: error.message });
  }
});

router.post('/api/admin/authors/:id/approve', verifyToken, isAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const existingAuthor = await prisma.author.findUnique({ where: { id } });
  
  let extraData = {};
  if (existingAuthor.extraData) {
    extraData = typeof existingAuthor.extraData === 'string' ? JSON.parse(existingAuthor.extraData) : existingAuthor.extraData;
  }
  const wasEdited = extraData.hasPendingEdits || existingAuthor.status === 'Edited';
  const wasReapplied = extraData.isReapplied;
  
  extraData.hasPendingEdits = false;
  extraData.originalProfileData = {};
  extraData.isReapplied = false;

  const author = await prisma.author.update({
    where: { id },
    data: { status: 'Active', rejectionReason: null, extraData: JSON.stringify(extraData) }
  });
  // Approve their pending books too
  await prisma.book.updateMany({
    where: { authorId: id, status: 'Pending' },
    data: { status: 'Approved' }
  });
  
  // Send approval email
  if (wasEdited) {
    const emailContent = `
      <p>Dear ${author.name},</p>
      <p>Your recent profile updates have been officially approved by the Pune Authors' Association editorial team.</p>
      <p>Your changes are now live. You can log in to your dashboard to manage your inventory and profile.</p>
    `;
    if (typeof sendNotificationEmail === 'function' && typeof emailWrap === 'function') {
      sendNotificationEmail(author.email, "Profile Edits Approved!", emailWrap("Edits Approved", emailContent));
    }
  } else {
    const emailContent = `
      <p>Dear ${author.name},</p>
      <p>Congratulations! Your author profile has been officially approved by the Pune Authors' Association editorial team.</p>
      <p>Your books are now live in the catalogue. You can log in to your dashboard to manage your inventory, track orders, and participate in upcoming events.</p>
      <p>Welcome to the community!</p>
    `;
    if (typeof sendNotificationEmail === 'function' && typeof emailWrap === 'function') {
      sendNotificationEmail(author.email, "Welcome to PAA - Your Profile is Approved!", emailWrap("Profile Approved", emailContent));
    }
  }
  
  res.json(author);
});

// 5b. Operations Dashboard - Reject Author (with reason)
router.post('/api/admin/authors/:id/reject', verifyToken, isAdmin, async (req, res) => {
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

// Admin: Reject author edits (revert)
router.post('/api/admin/authors/:id/reject-edits', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existingAuthor = await prisma.author.findUnique({ where: { id }, include: { books: true } });
    if (!existingAuthor) return res.status(404).json({ error: 'Not found' });

    let currentExtraData = existingAuthor.extraData || {};
    if (typeof currentExtraData === 'string') {
        try { currentExtraData = JSON.parse(currentExtraData); } catch(e) { currentExtraData = {}; }
    }
    
    let updateData = {};
    if (currentExtraData.originalProfileData) {
       // Only restore specific top-level fields
       const fieldsToRestore = ['name', 'phone', 'bio', 'penName', 'city', 'state', 'instagram', 'facebook', 'photoUrl', 'qrCodeUrl', 'qualification', 'age', 'experience', 'skills', 'hobbies', 'whyJoining', 'aadharNumber', 'address', 'district', 'pincode', 'skillsJson', 'hobbiesJson', 'qualificationsJson'];
       for (const f of fieldsToRestore) {
           if (currentExtraData.originalProfileData[f] !== undefined) {
               updateData[f] = currentExtraData.originalProfileData[f];
           }
       }

       if (currentExtraData.originalProfileData.books) {
           const originalBooks = currentExtraData.originalProfileData.books;
           const currentBooks = await prisma.book.findMany({ where: { authorId: id } });
           const originalBookIds = originalBooks.map(b => b.id);
           
           await prisma.book.deleteMany({ 
               where: { authorId: id, id: { notIn: originalBookIds } } 
           });
           
           for (const ob of originalBooks) {
               const { id: bookId, authorId, createdAt, updatedAt, ...bookDataToRestore } = ob;
               const exists = currentBooks.find(b => b.id === bookId);
               if (exists) {
                   await prisma.book.update({ where: { id: bookId }, data: bookDataToRestore });
               } else {
                   await prisma.book.create({ data: { ...bookDataToRestore, authorId: id } });
               }
           }
       }
    }
    
    currentExtraData.hasPendingEdits = false;
    currentExtraData.editedProfileFields = [];
    currentExtraData.originalProfileData = {};

    const author = await prisma.author.update({
      where: { id },
      data: {
        ...updateData,
        status: 'Active',
        extraData: currentExtraData
      }
    });

    const { reason } = req.body || {};
    
    // Email notification
    const emailContent = `
      <p>Dear ${author.name},</p>
      <p>Your recent profile edits could not be approved and have been reverted to their previous state.</p>
      ${reason ? `<p><strong>Admin Note:</strong> ${reason}</p>` : ''}
      <p>Please review your information and try submitting again if needed.</p>
    `;
    if (typeof sendNotificationEmail === 'function' && typeof emailWrap === 'function') {
      sendNotificationEmail(author.email, "Profile Edits Rejected", emailWrap("Edits Rejected", emailContent));
    }

    res.json(author);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reject edits' });
  }
});


// Admin: Edit author profile (bio, name, phone, whatsapp, etc. and books)
router.put('/api/admin/authors/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, bio, phone, whatsapp, penName, city, state, address, aadharNumber, qualification, age, experience, skills, hobbies, instagram, facebook, whyJoining, books, district, pincode, dob } = req.body;
    const existingAuthor = await prisma.author.findUnique({ where: { id } });
    let currentExtraData = existingAuthor.extraData || {};
    if (typeof currentExtraData === 'string') {
        try { currentExtraData = JSON.parse(currentExtraData); } catch(e) { currentExtraData = {}; }
    }
    currentExtraData.hasPendingEdits = false;
    currentExtraData.editedProfileFields = [];

    const author = await prisma.author.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(phone !== undefined && { phone }),
        // whatsapp field removed
        ...(penName !== undefined && { penName }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(address !== undefined && { address }),
        ...(aadharNumber !== undefined && { aadharNumber }),
        ...(qualification !== undefined && { qualification }),
        ...(age !== undefined && { age }),
        ...(experience !== undefined && { experience }),
        ...(skills !== undefined && { skills }),
        ...(hobbies !== undefined && { hobbies }),
        ...(instagram !== undefined && { instagram }),
        ...(facebook !== undefined && { facebook }),
        ...(whyJoining !== undefined && { whyJoining }),
        ...(district !== undefined && { district }),
        ...(pincode !== undefined && { pincode }),
        ...(dob !== undefined && { dob }),
        ...(skills !== undefined && { skillsJson: (() => { try { return JSON.parse(skills) } catch(e) { return [] } })() }),
        ...(hobbies !== undefined && { hobbiesJson: (() => { try { return JSON.parse(hobbies) } catch(e) { return [] } })() }),
        extraData: currentExtraData
      }
    });

    if (books && Array.isArray(books)) {
      for (const b of books) {
        if (b.id) {
          await prisma.book.update({
            where: { id: parseInt(b.id) },
            data: {
              title: b.title,
              subtitle: b.subtitle,
              genre: b.genre,
              subGenre: b.subGenre,
              mrp: b.mrp ? parseFloat(b.mrp) : undefined,
              language: b.language,
              format: b.format,
              printFormat: b.printFormat,
              pages: b.pages ? parseInt(b.pages) : undefined,
              publisher: b.publisher,
              isbn: b.isbn,
              publicationDate: b.publicationDate,
              synopsis: b.synopsis,
              purpose: b.purpose,
              stock: b.stock ? parseInt(b.stock) : undefined
            }
          });
        }
      }
    }

    res.json(author);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update author' });
  }
});

// Admin Dashboard Overview Stats
router.get('/api/admin/dashboard-stats', verifyToken, isAdmin, async (req, res) => {
  const cached = getCache('admin:dashboard-stats');
  if (cached) return res.json(cached);
  try {
    const totalAuthors = await prisma.author.count();
    const totalBooks = await prisma.book.count();
    
    const [eventParticipations, pendingEventRegistrations] = await Promise.all([
      prisma.eventAuthor.count({ where: { optInStatus: 'Registered' } }),
      prisma.eventAuthor.count({ where: { optInStatus: 'Pending Approval' } })
    ]);
    
    // 1. Total Revenue
    const webRevenueAgg = await prisma.order.aggregate({
      _sum: { amount: true },
      where: { status: { in: ['Completed', 'Delivered', 'Shipped', 'Dispatched'] } }
    });
    const webRevenue = webRevenueAgg._sum.amount || 0;
    
    const posRevenueAgg = await prisma.posOrder.aggregate({
      _sum: { totalAmount: true }
    });
    const posRevenue = posRevenueAgg._sum.totalAmount || 0;
    const totalRevenue = webRevenue + posRevenue;

    // 2. Revenue Data (Last 6 Months)
    // We can use Prisma groupBy or queryRaw. To be safe across DBs, we'll fetch only date & amount for web orders
    // which is much lighter than fetching deep relations.
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0,0,0,0);
    
    const recentOrders = await prisma.order.findMany({
      where: { 
        status: { in: ['Completed', 'Delivered', 'Shipped', 'Dispatched'] },
        createdAt: { gte: sixMonthsAgo }
      },
      select: { amount: true, createdAt: true }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueDataMap = {};
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      revenueDataMap[key] = { month: monthNames[d.getMonth()], revenue: 0, authors: 0 };
    }

    recentOrders.forEach(o => {
      const d = new Date(o.createdAt);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (revenueDataMap[key]) {
        revenueDataMap[key].revenue += o.amount;
      }
    });
    const revenueData = Object.values(revenueDataMap);

    // 3. Top Customers
    // Using raw SQL is fastest for complex aggregations, but since SQLite/Postgres might differ,
    // we use Prisma groupBy. Prisma groupBy requires select/where.
    const topCustomersGrouped = await prisma.order.groupBy({
      by: ['customerEmail', 'customerName'],
      where: { customerEmail: { not: null }, status: { in: ['Completed', 'Delivered', 'Shipped', 'Dispatched'] } },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 10
    });
    const topCustomers = topCustomersGrouped.map(c => ({
      email: c.customerEmail,
      name: c.customerName,
      totalSpent: c._sum.amount || 0,
      ordersCount: c._count.id
    }));

    // 4. Sales by Author, Genre, Books
    // For this, we'll fetch only the needed fields from OrderItem instead of the entire Order object
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: { status: { in: ['Completed', 'Delivered', 'Shipped', 'Dispatched'] } }
      },
      select: {
        quantity: true,
        book: {
          select: { title: true, genre: true, mrp: true, author: { select: { name: true } } }
        }
      }
    });

    const salesByAuthorMap = {};
    const salesByGenreMap = {};
    const bookSalesMap = {};

    orderItems.forEach(item => {
      if (!item.book) return;
      const authorName = item.book.author?.name || 'Unknown';
      const genre = item.book.genre || 'Other';
      const bookTitle = item.book.title;
      const itemRev = item.quantity * item.book.mrp;

      if (!salesByAuthorMap[authorName]) salesByAuthorMap[authorName] = { name: authorName, revenue: 0, units: 0 };
      salesByAuthorMap[authorName].revenue += itemRev;
      salesByAuthorMap[authorName].units += item.quantity;

      if (!salesByGenreMap[genre]) salesByGenreMap[genre] = { name: genre, revenue: 0, units: 0 };
      salesByGenreMap[genre].revenue += itemRev;
      salesByGenreMap[genre].units += item.quantity;

      if (!bookSalesMap[bookTitle]) bookSalesMap[bookTitle] = { title: bookTitle, author: authorName, revenue: 0, units: 0 };
      bookSalesMap[bookTitle].revenue += itemRev;
      bookSalesMap[bookTitle].units += item.quantity;
    });

    const salesByAuthor = Object.values(salesByAuthorMap).sort((a, b) => b.revenue - a.revenue);
    const salesByGenre = Object.values(salesByGenreMap).sort((a, b) => b.revenue - a.revenue);
    const topSellingBooks = Object.values(bookSalesMap).sort((a, b) => b.units - a.units).slice(0, 10);

    // 5. Event Sales
    const posItems = await prisma.posOrderItem.findMany({
      select: {
        quantity: true,
        posOrder: { select: { event: { select: { name: true } } } }
      }
    });
    const eventSalesMap = {};
    posItems.forEach(item => {
      if (!item.posOrder || !item.posOrder.event) return;
      const eventName = item.posOrder.event.name;
      if (!eventSalesMap[eventName]) eventSalesMap[eventName] = { name: eventName, booksSold: 0 };
      eventSalesMap[eventName].booksSold += item.quantity;
    });
    const allEvents = await prisma.event.findMany({ select: { name: true } });
    allEvents.forEach(evt => {
      if (!eventSalesMap[evt.name]) eventSalesMap[evt.name] = { name: evt.name, booksSold: 0 };
    });
    const eventSalesData = Object.values(eventSalesMap);

    // 6. Quick Alerts & Activities
    const lowStockAlerts = await prisma.book.findMany({
      where: { stock: { lt: 10 } },
      include: { author: true, reviews: { select: { rating: true } } },
      take: 20
    });

    const [recentAuthors, latestOrders, recentEvents] = await Promise.all([
      prisma.author.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, createdAt: true } }),
      prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, amount: true, customerName: true, createdAt: true } }),
      prisma.eventAuthor.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, createdAt: true, author: { select: { name: true } }, event: { select: { name: true } } } })
    ]);
    
    const activities = [
      ...recentAuthors.map(a => ({ id: `auth-${a.id}`, action: 'New Author Registration', subject: a.name, createdAt: a.createdAt, type: 'author' })),
      ...latestOrders.map(o => ({ id: `ord-${o.id}`, action: 'Order Received', subject: `INR ${o.amount} from ${o.customerName}`, createdAt: o.createdAt, type: 'order' })),
      ...recentEvents.map(e => ({ id: `evt-${e.id}`, action: 'Event RSVP', subject: `${e.author?.name || 'Author'} joined ${e.event?.name || 'Event'}`, createdAt: e.createdAt, type: 'event' }))
    ];
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentActivities = activities.slice(0, 8);

    const result = { 
      totalAuthors, totalBooks, eventParticipations, totalRevenue, revenueData, recentActivities,
      salesByAuthor, salesByGenre, topSellingBooks, topCustomers, lowStockAlerts, eventSalesData, pendingEventRegistrations
    };
    
    setCache('admin:dashboard-stats', result, 45 * 1000);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

// Admin Books
router.get('/api/admin/books', verifyToken, isAdmin, async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      where: {
        author: {
          status: 'Active'
        }
      },
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

router.delete('/api/admin/books/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await prisma.book.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Admin: Edit book details (title, genre, subGenre, mrp, stock, synopsis)
router.put('/api/admin/books/:id', verifyToken, isAdmin, async (req, res) => {
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


router.post('/api/admin/books/:id/approve', verifyToken, isAdmin, async (req, res) => {
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

router.post('/api/admin/books/:id/reject', verifyToken, isAdmin, async (req, res) => {
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
router.get('/api/admin/activities', verifyToken, isAdmin, async (req, res) => {
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

router.post('/api/admin/activities', verifyToken, isAdmin, async (req, res) => {
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
router.get('/api/admin/authors/:id/dashboard-data', verifyToken, isAdmin, async (req, res) => {
  try {
    const authorProfile = await prisma.author.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { 
        books: { include: { reviews: true } },
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
        dispatchedAt: item.dispatchedAt,
        deliveredAt: item.deliveredAt,
        date: item.createdAt.toISOString().split('T')[0]
      }));
    }

    res.json({ authorProfile, authorOrders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch author dashboard data' });
  }
});

router.post('/api/author/reapply', verifyToken, async (req, res) => {
  try {
    const { name, phone, bio, whatsapp, penName, city, state, address, aadharNumber, qualification, institution, subject, age, experience, skills, hobbies, transactionId, extraData } = req.body;
    let updateData = { status: 'Pending', rejectionReason: null };
    
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    // whatsapp field removed
    if (penName !== undefined) updateData.penName = penName;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (address !== undefined) updateData.address = address;
    if (aadharNumber !== undefined) updateData.aadharNumber = aadharNumber;
    if (qualification !== undefined) updateData.qualification = qualification;
    if (institution !== undefined) updateData.institution = institution;
    if (subject !== undefined) updateData.subject = subject;
    if (age !== undefined) updateData.age = age;
    if (experience !== undefined) updateData.experience = experience;
    if (skills !== undefined) updateData.skills = skills;
    if (hobbies !== undefined) updateData.hobbies = hobbies;
    if (transactionId !== undefined) updateData.transactionId = transactionId;
    if (extraData !== undefined) updateData.extraData = extraData;

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
router.get('/api/author/dashboard-data', verifyToken, async (req, res) => {
  const cacheKey = `author:dashboard:${req.user.email}`;
  if (!req.query.t) {
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);
  }
  try {
    const authorProfile = await prisma.author.findUnique({
      where: { email: req.user.email },
      include: { 
        books: { include: { reviews: true } },
        eventRegistrations: {
          include: { activity: true }
        }
      }
    });

    if (!authorProfile) return res.status(404).json({ error: 'Author profile not found' });

    try {
      authorProfile.donationRegistrations = await prisma.donationRegistration.findMany({
        where: { authorId: authorProfile.id },
        include: {
          announcement: { include: { library: true } },
          books: { include: { book: true } }
        }
      });
    } catch (e) {
      authorProfile.donationRegistrations = [];
    }

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
        transactionId: item.order.transactionId,
        paymentVerified: item.order.status === 'Completed',
        paymentFailed: item.order.status === 'Payment Not Received',
        createdAt: item.createdAt,
        acceptedAt: item.acceptedAt,
        dispatchedAt: item.dispatchedAt,
        deliveredAt: item.deliveredAt,
        expectedDeliveryDate: item.expectedDeliveryDate,
        autoDelivered: item.autoDelivered,
        date: item.createdAt.toISOString().split('T')[0],
        feedbackRating: item.feedbackRating,
        feedbackCondition: item.feedbackCondition,
        feedbackPackaging: item.feedbackPackaging,
        feedbackAsExpected: item.feedbackAsExpected,
        feedbackBuyAgain: item.feedbackBuyAgain,
        feedbackComments: item.feedbackComments,
        subtotal: item.order.subtotal,
        bundleDiscount: item.order.bundleDiscount,
        deliveryCharges: item.order.deliveryCharges,
        orderAmount: item.order.amount
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
    const posOrders = await prisma.posOrder.findMany({
      where: { authorId: authorProfile.id },
      include: { items: { include: { book: true } } }
    });
    const notifications = await prisma.notification.findMany({
      where: { OR: [{ target: 'ALL' }, { target: authorProfile.name }, { target: `@${authorProfile.name}` }] },
      orderBy: { createdAt: 'desc' }
    });
    let activeDonations = [];
    try {
      activeDonations = await prisma.donationAnnouncement.findMany({
        where: { visibility: 'Published' },
        include: { library: true }
      });
    } catch (e) {}

    const result = { authorProfile, authorOrders, dynamicFields, eventInvites, listedBooks, posOrders, notifications, activeDonations };
    setCache(cacheKey, result, 20 * 1000); // 20s cache for dashboard
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Update Book Inventory (Stock)
router.put('/api/author/inventory/:id', verifyToken, async (req, res) => {
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
router.put('/api/author/profile/bio', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    const { bio, phone, whatsapp, name, penName, city, state, instagram, facebook, address, aadharNumber, qualification, institution, subject, age, experience, skills, hobbies, whyJoining } = req.body;
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });

    const updateData = {
      ...(bio !== undefined && { bio }),
      ...(phone !== undefined && { phone }),
      // whatsapp field removed
      ...(name !== undefined && { name }),
      ...(penName !== undefined && { penName }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(instagram !== undefined && { instagram }),
      ...(facebook !== undefined && { facebook }),
      ...(address !== undefined && { address }),
      ...(aadharNumber !== undefined && { aadharNumber }),
      ...(qualification !== undefined && { qualification }),
      ...(institution !== undefined && { institution }),
      ...(subject !== undefined && { subject }),
      ...(age !== undefined && { age }),
      ...(experience !== undefined && { experience }),
      ...(skills !== undefined && { skills }),
      ...(hobbies !== undefined && { hobbies }),
      ...(whyJoining !== undefined && { whyJoining }),
        ...(district !== undefined && { district }),
        ...(pincode !== undefined && { pincode }),
        ...(dob !== undefined && { dob }),
        ...(skills !== undefined && { skillsJson: (() => { try { return JSON.parse(skills) } catch(e) { return [] } })() }),
        ...(hobbies !== undefined && { hobbiesJson: (() => { try { return JSON.parse(hobbies) } catch(e) { return [] } })() }),
      rejectionReason: null // Clear previous rejection if any
    };

    let currentExtraData = author.extraData || {};
    if (typeof currentExtraData === 'string') {
        try { currentExtraData = JSON.parse(currentExtraData); } catch(e) { currentExtraData = {}; }
    }
    let editedFields = currentExtraData.editedProfileFields || [];
    let originalData = currentExtraData.originalProfileData || {};

    for (const key of Object.keys(updateData)) {
      if (key === 'rejectionReason') continue;
      if (updateData[key] !== author[key] && !editedFields.includes(key)) {
        editedFields.push(key);
        if (!(key in originalData)) {
            originalData[key] = author[key];
        }
      }
    }

    if (req.file) {
      updateData.photoUrl = `/uploads/${req.file.filename}`;
      if (!editedFields.includes('photoUrl')) {
          editedFields.push('photoUrl');
          if (!('photoUrl' in originalData)) originalData['photoUrl'] = author.photoUrl;
      }
    }

    if (editedFields.length > 0) {
      currentExtraData.hasPendingEdits = true;
      currentExtraData.editedProfileFields = editedFields;
      currentExtraData.originalProfileData = originalData;
      updateData.extraData = currentExtraData;
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
router.put('/api/author/books/:id', verifyToken, async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    const { title, subtitle, genre, subGenre, mrp, stock, synopsis, pages, language, isbn, publisher, publicationDate, edition, format, printFormat, purpose } = req.body;
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.authorId !== author.id) return res.status(403).json({ error: 'Not authorized' });

    
    let isOverpriced = false;
    if (pages && printFormat && mrp) {
        const rate = printFormat === 'Black & White' ? 1 : 3;
        const fairPrice = (parseInt(pages) * rate) + 100;
        isOverpriced = parseFloat(mrp) > fairPrice;
    }

    const updated = await prisma.book.update({
      where: { id: bookId },
      data: {
        ...(mrp !== undefined && pages !== undefined && printFormat !== undefined && { overpriced: isOverpriced }),
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
        ...(printFormat !== undefined && { printFormat }),
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
router.put('/api/author/books/:id/cover', verifyToken, upload.single('cover'), async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    if (!req.file) return res.status(400).json({ error: 'No cover image uploaded' });

    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.authorId !== author.id) return res.status(403).json({ error: 'Not authorized' });

    const coverUrl = `/uploads/${req.file.filename}`;
    
    let isOverpriced = false;
    if (pages && printFormat && mrp) {
        const rate = printFormat === 'Black & White' ? 1 : 3;
        const fairPrice = (parseInt(pages) * rate) + 100;
        isOverpriced = parseFloat(mrp) > fairPrice;
    }

    const updated = await prisma.book.update({
      where: { id: bookId },
      data: {
        ...(mrp !== undefined && pages !== undefined && printFormat !== undefined && { overpriced: isOverpriced }), coverUrl }
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
router.get('/api/admin/pending-books', verifyToken, isAdmin, async (req, res) => {
  try {
    const pendingBooks = await prisma.book.findMany({
      where: { status: 'Pending' },
      include: { author: true, reviews: { select: { rating: true } } }
    });
    res.json(pendingBooks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pending books' });
  }
});

// Admin: Approve a pending book
router.post('/api/admin/books/:id/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    
    let isOverpriced = false;
    if (pages && printFormat && mrp) {
        const rate = printFormat === 'Black & White' ? 1 : 3;
        const fairPrice = (parseInt(pages) * rate) + 100;
        isOverpriced = parseFloat(mrp) > fairPrice;
    }

    const updated = await prisma.book.update({
      where: { id: bookId },
      data: {
        ...(mrp !== undefined && pages !== undefined && printFormat !== undefined && { overpriced: isOverpriced }), status: 'Approved' }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to approve book' });
  }
});
router.post('/api/author/books', verifyToken, upload.single('cover'), async (req, res) => {
  try {
    const { title, subtitle, genre, subGenre, synopsis, pages, mrp, stock, overpriced, isOverpriced, language, isbn, publisher, publicationDate, edition, format, printFormat, purpose } = req.body;
    
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
        overpriced: overpriced === 'true' || isOverpriced === 'true',
        language: language || null,
        isbn: isbn || null,
        publisher: publisher || null,
        publicationDate: publicationDate || null,
        edition: edition || null,
        format: format || null,
        printFormat: printFormat,
            purpose: purpose || null,
        purpose: purpose || null,
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
router.get('/api/activities', async (req, res) => {
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

// Pay Late Delivery Fine
router.post('/api/author/fine/pay', verifyToken, upload.single('paymentScreenshot'), async (req, res) => {
  try {
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });

    let extraData = typeof author.extraData === 'string' ? JSON.parse(author.extraData || '{}') : (author.extraData || {});
    extraData = {
      ...extraData,
      fineStatus: 'Pending Verification',
      finePaymentScreenshot: req.file ? `/uploads/${req.file.filename}` : null,
      finePaymentDate: new Date().toISOString()
    };

    const updatedAuthor = await prisma.author.update({
      where: { id: author.id },
      data: { extraData }
    });

    await prisma.notification.create({
      data: {
        message: `${author.name} has submitted payment for their late delivery fine.`,
        target: 'ADMIN'
      }
    });

    invalidateCache(`authorData_${author.email}`);
    invalidateCache('adminAuthors');
    res.json(updatedAuthor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to pay fine' });
  }
});

// Admin: Approve Fine Payment
router.post('/api/admin/authors/:id/approve-fine', verifyToken, isAdmin, async (req, res) => {
  try {
    const author = await prisma.author.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!author) return res.status(404).json({ error: 'Author not found' });
    
    let extraData = typeof author.extraData === 'string' ? JSON.parse(author.extraData || '{}') : (author.extraData || {});
    
    // Add to history
    if (!extraData.fineHistory) extraData.fineHistory = [];
    extraData.fineHistory.push({
      amount: extraData.lateFines || 0,
      chargedAt: extraData.fineDate || null,
      paidAt: extraData.finePaymentDate || null,
      approvedAt: new Date().toISOString()
    });
    
    extraData.lateFines = 0;
    extraData.fineDate = null;
    extraData.lateNotificationDate = null;
    extraData.fineStatus = null;
    extraData.finePaymentScreenshot = null;
    extraData.finePaymentDate = null;
    extraData.lastFinePaidAt = new Date().toISOString();
    
    const updatedAuthor = await prisma.author.update({
      where: { id: author.id },
      data: { extraData }
    });
    
    await prisma.notification.create({
      data: {
        message: 'Your late delivery fine payment has been approved. Your account has been reactivated.',
        target: author.email
      }
    });
    
    invalidateCache(`authorData_${author.email}`);
    invalidateCache('adminAuthors');
    res.json(updatedAuthor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve fine' });
  }
});

// Admin: Reject Fine Payment
router.post('/api/admin/authors/:id/reject-fine', verifyToken, isAdmin, async (req, res) => {
  try {
    const author = await prisma.author.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!author) return res.status(404).json({ error: 'Author not found' });
    
    let extraData = typeof author.extraData === 'string' ? JSON.parse(author.extraData || '{}') : (author.extraData || {});
    extraData.fineStatus = null;
    extraData.finePaymentScreenshot = null;
    
    const updatedAuthor = await prisma.author.update({
      where: { id: author.id },
      data: { extraData }
    });
    
    invalidateCache(`authorData_${author.email}`);
    invalidateCache('adminAuthors');
    res.json(updatedAuthor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject fine' });
  }
});


// Register for Activity
router.post('/api/author/activities/register', verifyToken, upload.single('paymentScreenshot'), async (req, res) => {
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

router.put('/api/orders/:id/cancel', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = await prisma.order.findUnique({ where: { id }, include: { items: { include: { book: { include: { author: true, reviews: { select: { rating: true } } } } } } } });
    if (!order) return res.status(404).json({ error: 'Not found' });
    if (order.customerEmail !== req.user.email) return res.status(403).json({ error: 'Forbidden' });
    
    // Only allow cancel if not dispatched
    const cannotCancel = order.items.some(i => i.status === 'Dispatched' || i.status === 'Completed');
    if (cannotCancel) return res.status(400).json({ error: 'Cannot cancel dispatched orders' });

    if (order.status === 'Cancelled') {
      return res.json({ message: 'Order is already cancelled' });
    }

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

router.post('/api/orders', optionalVerifyToken, upload.single('paymentScreenshot'), async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, address, amount, items, transactionId } = req.body;
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

    const emailToUse = req.user ? req.user.email : (customerEmail || 'guest@example.com');
    
    // Find or create customer
    let customer = await prisma.customer.findUnique({ where: { email: emailToUse } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName || 'Guest',
          email: emailToUse,
          phone: customerPhone || null
        }
      });
    } else if (customerName && customer.name === 'Guest') {
      // Update guest name to actual name if provided now
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { name: customerName, phone: customerPhone || customer.phone }
      });
    }

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        customerName,
        customerEmail: emailToUse,
        customerPhone,
        address,
        amount: parseFloat(amount),
        subtotal: parseFloat(req.body.subtotal || 0),
        bundleDiscount: parseFloat(req.body.bundleDiscount || 0),
        deliveryCharges: parseFloat(req.body.deliveryCharges || 0),
        paymentScreenshot,
        transactionId: transactionId || null,
        items: {
          create: parsedItems.map(item => ({
            bookId: parseInt(item.bookId),
            quantity: parseInt(item.quantity)
          }))
        }
      },
      include: { items: { include: { book: { include: { author: true, reviews: { select: { rating: true } } } } } } }
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
          <tfoot>
            ${order.bundleDiscount > 0 ? `<tr><td colspan="3" style="font-weight:600;text-align:right">Subtotal</td><td style="font-weight:600;text-align:right">${inr(order.subtotal)}</td></tr>
            <tr><td colspan="3" style="font-weight:600;text-align:right;color:green">Bundle Discount</td><td style="font-weight:600;text-align:right;color:green">-${inr(order.bundleDiscount)}</td></tr>` : ''}
            ${order.deliveryCharges > 0 ? `<tr><td colspan="3" style="font-weight:600;text-align:right">Delivery Charges</td><td style="font-weight:600;text-align:right">+${inr(order.deliveryCharges)}</td></tr>` : ''}
            <tr><td colspan="3" style="font-weight:700;text-align:right">Grand Total</td><td style="font-weight:700;text-align:right">${inr(order.amount)}</td></tr>
          </tfoot>
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
            <tfoot>
              ${order.bundleDiscount > 0 ? `<tr><td colspan="2" style="font-weight:600;text-align:right">Subtotal</td><td style="font-weight:600;text-align:right">${inr(order.subtotal)}</td></tr>
              <tr><td colspan="2" style="font-weight:600;text-align:right;color:green">Bundle Discount</td><td style="font-weight:600;text-align:right;color:green">-${inr(order.bundleDiscount)}</td></tr>` : ''}
              ${order.deliveryCharges > 0 ? `<tr><td colspan="2" style="font-weight:600;text-align:right">Delivery Charges</td><td style="font-weight:600;text-align:right">+${inr(order.deliveryCharges)}</td></tr>` : ''}
              <tr><td colspan="2" style="font-weight:700;text-align:right">Grand Total</td><td style="font-weight:700;text-align:right">${inr(order.amount)}</td></tr>
            </tfoot>
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
router.put('/api/order-items/:id/author-approve', verifyToken, async (req, res) => {
  try {
    const orderItemId = parseInt(req.params.id);
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { book: { include: { author: true, reviews: { select: { rating: true } } } }, order: true }
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
      include: { book: { include: { author: true, reviews: { select: { rating: true } } } }, order: true }
    });

    // Deduct stock and capture resulting value for low-stock check
    // [PRE-LAUNCH] Halt Deductions
    const bookAfterDeduct = await prisma.book.findUnique({
      where: { id: orderItem.bookId },
      include: { author: true }
    });
    // Fire low-stock alert asynchronously (non-blocking) if stock drops below threshold
    if (bookAfterDeduct.stock < 10) {
      fireStockAlert(bookAfterDeduct.id, bookAfterDeduct.title, bookAfterDeduct.author).catch(() => {});
    }

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
router.get('/api/order-items/:id/invoice', verifyToken, async (req, res) => {
  try {
    const orderItemId = parseInt(req.params.id);
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { book: { include: { author: true, reviews: { select: { rating: true } } } }, order: true }
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
router.put('/api/order-items/:id/author-reject', verifyToken, async (req, res) => {
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
router.get('/api/admin/reports/sales', verifyToken, isAdmin, async (req, res) => {
  try {
    const period = req.query.period || 'daily';
    const webOrders = await prisma.order.findMany({
      where: { status: { in: ['Completed', 'Delivered', 'Shipped', 'Dispatched'] } },
      include: { items: { include: { book: { include: { author: true, reviews: { select: { rating: true } } } } } } }
    });
    
    const posOrders = await prisma.posOrder.findMany({
      include: { event: true, items: { include: { book: { include: { author: true, reviews: { select: { rating: true } } } } } } }
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

router.get('/api/admin/reports/chart', verifyToken, isAdmin, async (req, res) => {
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
router.get('/api/admin/orders/export', verifyToken, isAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: { include: { book: { include: { author: true, reviews: { select: { rating: true } } } } } } },
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

// Admin Customers Route
router.get('/api/admin/customers', verifyToken, isAdmin, async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        orders: {
          include: { items: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Delete Order
router.delete('/api/admin/orders/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    await prisma.orderItem.deleteMany({ where: { orderId } });
    await prisma.order.delete({ where: { id: orderId } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

router.get('/api/admin/orders', verifyToken, isAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: { include: { book: { include: { author: true, reviews: { select: { rating: true } } } } } } },
      orderBy: { createdAt: 'desc' }
    });
    const mapped = orders.map(ord => ({
      id: `ORD-${ord.id.toString().padStart(4, '0')}`,
      dbId: ord.id,
      date: ord.createdAt.toISOString().split('T')[0],
      customer: ord.customerName,
      customerEmail: ord.customerEmail,
      customerPhone: ord.customerPhone,
      address: ord.address,
      subtotal: ord.subtotal || 0,
      deliveryCharges: ord.deliveryCharges || 0,
      bundleDiscount: ord.bundleDiscount || 0,
      items: ord.items.map(i => ({ 
        id: i.id,
        title: i.book.title, 
        coverUrl: i.book.coverUrl,
        qty: i.quantity, 
        authorName: i.book.author.name,
        authorId: i.book.author.id,
        authorEmail: i.book.author.email,
        status: i.status,
        createdAt: i.createdAt,
        dispatchedAt: i.dispatchedAt,
        deliveredAt: i.deliveredAt,
        trackingNumber: i.trackingNumber,
        feedbackCondition: i.feedbackCondition,
        feedbackRating: i.feedbackRating,
        feedbackComments: i.feedbackComments,
        bookAvgRating: i.book.reviews?.length ? (i.book.reviews.reduce((a, r) => a + r.rating, 0) / i.book.reviews.length).toFixed(1) : null
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

router.put('/api/admin/orders/:id/status', verifyToken, isAdmin, async (req, res) => {
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

router.put('/api/order-items/:id/status', verifyToken, async (req, res) => {
  try {
    let { status } = req.body;
    
    // Check if buyer has already submitted feedback
    const existing = await prisma.orderItem.findUnique({ where: { id: parseInt(req.params.id) } });
    if (status === 'Delivered' && existing.feedbackRating != null) {
      status = 'Completed';
    }

    let updateData = { status };
    if (status === 'Delivered' || status === 'Completed') {
       updateData.deliveredAt = new Date();
    } else if (status === 'Accepted') {
       updateData.acceptedAt = new Date();
    } else if (status === 'Dispatched') {
       updateData.dispatchedAt = new Date();
    }

    const orderItem = await prisma.orderItem.update({
      where: { id: parseInt(req.params.id) },
      data: updateData
    });
    res.json(orderItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});


router.put('/api/order-items/:id/reject', verifyToken, async (req, res) => {
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

router.put('/api/order-items/:id/accept', verifyToken, async (req, res) => {
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
      data: { status: 'Accepted', acceptedAt: new Date() },
      include: { book: { include: { author: true, reviews: { select: { rating: true } } } } }
    });
    // Deduct stock immediately
    if (orderItem) {
       // [PRE-LAUNCH] Halt Deductions
       // await prisma.book.update({
       //   where: { id: orderItem.bookId },
       //   data: { stock: { decrement: orderItem.quantity } }
       // });
    }
    // Invalidate cache
    if (orderItem.book?.author?.email) invalidateCache(`author:dashboard:${orderItem.book.author.email}`);
    res.json(orderItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to accept order' });
  }
});


router.put('/api/order-items/:id/dispatch', verifyToken, async (req, res) => {
  try {
    const { trackingNumber } = req.body;
    if (!trackingNumber || trackingNumber.trim() === '') {
      return res.status(400).json({ error: 'Tracking Number is mandatory for dispatch.' });
    }

    const now = new Date();
    const expectedDeliveryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const orderItem = await prisma.orderItem.update({
      where: { id: parseInt(req.params.id) },
      data: { 
        status: 'Dispatched', 
        trackingNumber, 
        dispatchedAt: now,
        expectedDeliveryDate
      },
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

router.put('/api/order-items/:id/acknowledge', verifyToken, async (req, res) => {
  try {
    const { condition, rating, comments, packaging, asExpected, buyAgain } = req.body || {};
    const existing = await prisma.orderItem.findUnique({ 
      where: { id: parseInt(req.params.id) },
      include: { book: { include: { author: true } }, order: true }
    });

    const orderItem = await prisma.orderItem.update({
      where: { id: parseInt(req.params.id) },
      data: { 
        status: 'Delivered', 
        deliveredAt: existing.deliveredAt || new Date(),
        feedbackCondition: condition || null,
        feedbackRating: rating ? parseInt(rating) : null,
        feedbackComments: comments || null,
        feedbackPackaging: packaging || null,
        feedbackAsExpected: asExpected || null,
        feedbackBuyAgain: buyAgain || null
      }
    });

    if (req.body.bookRating && existing) {
      await prisma.bookReview.create({
        data: {
          rating: parseInt(req.body.bookRating),
          comment: req.body.bookReviewComment || '',
          reviewerName: existing.order?.customerName || 'Anonymous',
          bookId: existing.bookId
        }
      });
    }

    res.json(orderItem);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to acknowledge order' });
  }
});


// 8. Operations Dashboard - Verify Order
router.post('/api/admin/orders/:id/verify', verifyToken, isAdmin, async (req, res) => {
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

router.post('/api/admin/orders/:id/reject-payment', verifyToken, isAdmin, async (req, res) => {
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
router.post('/api/contact', async (req, res) => {
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

router.get('/api/admin/queries', verifyToken, isAdmin, async (req, res) => {
  try {
    const queries = await prisma.query.findMany({
      include: { author: true },
      orderBy: { createdAt: 'desc' }
    });
    const mappedQueries = queries.map(q => ({...q, itemType: 'Query'}));

    const inquiries = await prisma.contactInquiry.findMany({
      orderBy: { createdAt: 'desc' }
    });
    const mappedInquiries = inquiries.map(i => ({
      id: `inq_${i.id}`,
      originalId: i.id,
      subject: 'Contact Form Inquiry',
      message: i.message,
      author: { name: i.name, email: i.email },
      status: 'Unread',
      itemType: 'Message',
      createdAt: i.createdAt
    }));

    const combined = [...mappedQueries, ...mappedInquiries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(combined);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});
// 10. Gallery Events
router.get('/api/gallery', async (req, res) => {
  try {
    const events = await prisma.galleryEvent.findMany({
      orderBy: { date: 'desc' },
      include: { images: { where: { status: 'Approved' } } }
    });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch gallery events' });
  }
});

router.post('/api/admin/gallery', verifyToken, isAdmin, upload.single('photo'), async (req, res) => {
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
router.put('/api/admin/gallery/:id', verifyToken, isAdmin, upload.single('photo'), async (req, res) => {
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

router.delete('/api/admin/gallery/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.galleryEvent.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete gallery event' });
  }
});

router.post('/api/admin/gallery/:id/images', verifyToken, isAdmin, upload.single('photo'), async (req, res) => {
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
        dateTaken: dateTaken ? new Date(dateTaken) : null,
        status: 'Approved'
      }
    });
    res.status(201).json(image);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add image' });
  }
});

router.delete('/api/admin/gallery/images/:imageId', verifyToken, isAdmin, async (req, res) => {
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
router.get('/api/admin/events/:id/registrations', verifyToken, isAdmin, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const registrations = await prisma.eventAuthor.findMany({
      where: { eventId, optInStatus: { not: 'Pending' } },
      include: {
        author: {
          include: { books: true }
        }
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

router.post('/api/admin/events/:eventId/author/:authorId/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const authorId = parseInt(req.params.authorId);
    
    await prisma.eventAuthor.updateMany({
      where: { eventId, authorId },
      data: { optInStatus: 'Registered' }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve' });
  }
});

router.put('/api/admin/events/:eventId/author/:authorId/transaction', verifyToken, isAdmin, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const authorId = parseInt(req.params.authorId);
    const { transactionId } = req.body;
    
    await prisma.eventAuthor.updateMany({
      where: { eventId, authorId },
      data: { transactionId }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update transaction ID' });
  }
});

router.post('/api/admin/events/:eventId/author/:authorId/reject', verifyToken, isAdmin, async (req, res) => {
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



// --- QUERIES (SUPPORT) ---



// --- DYNAMIC AUTHOR FIELDS ---
router.get('/api/admin/author-fields', verifyToken, isAdmin, (req, res) => {
    try {
        const settings = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'settings.json')));
        res.json(settings.authorDynamicFields || []);
    } catch (e) {
        res.json([]);
    }
});

router.get('/api/author-fields', (req, res) => {
    try {
        const settings = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'settings.json')));
        res.json(settings.authorDynamicFields || []);
    } catch (e) {
        res.json([]);
    }
});

router.post('/api/admin/author-fields', verifyToken, isAdmin, (req, res) => {
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

router.put('/api/author/profile/extra', verifyToken, async (req, res) => {
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
router.get('/api/admin/author-fields', verifyToken, isAdmin, (req, res) => {
    try {
        const settings = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'settings.json')));
        res.json(settings.authorDynamicFields || []);
    } catch(e) { res.json([]); }
});

router.post('/api/admin/author-fields', verifyToken, isAdmin, (req, res) => {
    try {
        const p = require('path').join(__dirname, 'settings.json');
        const settings = require('fs').existsSync(p) ? JSON.parse(require('fs').readFileSync(p)) : {};
        settings.authorDynamicFields = req.body.fields;
        require('fs').writeFileSync(p, JSON.stringify(settings, null, 2));
        res.json({ success: true });
    } catch(e) { res.status(500).json({ error: 'Failed to save settings' }); }
});

router.put('/api/author/profile/extra', verifyToken, async (req, res) => {
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
router.get('/api/author/events', verifyToken, async (req, res) => {
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
    const listedBooks = await prisma.eventBook.findMany({ 
        where: { authorId: author.id },
        include: { book: true }
    });

    // All past events (for the gallery / history section in author dashboard)
    const pastEvents = await prisma.event.findMany({ 
      where: { status: { in: ['Past', 'Legacy Archive'] }, broadcastStatus: 'Published' }, 
      orderBy: { date: 'desc' },
      include: {
        _count: { select: { eventAuthors: { where: { optInStatus: 'Registered' } }, eventBooks: true } }
      }
    });

    const invitedEventIds = eventInvites.map(ei => ei.eventId);
    const availableEvents = await prisma.event.findMany({
      where: {
        id: { notIn: invitedEventIds },
        status: { in: ['Upcoming', 'Upcoming/Live'] }
      },
      orderBy: { createdAt: 'desc' }
    });

    const result = { eventInvites, books, listedBooks, pastEvents, availableEvents };
    setCache(cacheKey, result, 30 * 1000);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.post('/api/author/events/:eventId/opt-in', verifyToken, upload.single('paymentScreenshot'), async (req, res) => {
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
          optInStatus: 'Pending Approval',
          ...(paymentScreenshot && { paymentScreenshot })
        }
      });
      
      // ── STEP 4: Remove old EventBook records and recreate ──
      await tx.eventBook.deleteMany({ where: { eventId, authorId: author.id } });
      
      // ── STEP 5: Deduct new listedStock from Book.stock and create EventBook records ──
      const lowStockBooksAfterEvent = [];
      if (booksToLink && booksToLink.length > 0) {
         for (const b of booksToLink) {
           const requested = parseInt(b.stock);
           // [PRE-LAUNCH] Halt Deductions
           const bookAfterDeduct = await tx.book.findUnique({
             where: { id: parseInt(b.bookId) },
             include: { author: true }
           });
           // Collect books that fall below threshold for post-transaction alerting
           if (bookAfterDeduct.stock < 10) {
             lowStockBooksAfterEvent.push(bookAfterDeduct);
           }
         }
         const eventBooksData = booksToLink.map((b) => ({
            eventId,
            authorId: author.id,
            bookId: parseInt(b.bookId),
            listedStock: parseInt(b.stock)
         }));
         await tx.eventBook.createMany({ data: eventBooksData });
      }
      // Store for post-transaction processing (transactions cannot use external I/O)
      author._lowStockBooksAfterEvent = lowStockBooksAfterEvent;
    });

    // Fire low-stock alerts after transaction commits (non-blocking)
    if (author._lowStockBooksAfterEvent && author._lowStockBooksAfterEvent.length > 0) {
      for (const b of author._lowStockBooksAfterEvent) {
        fireStockAlert(b.id, b.title, author).catch(() => {});
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    if (error.message.includes('Insufficient stock') || error.message.includes('Listed quantity') || error.message.includes('Book not found')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to opt in', details: error.message, stack: error.stack });
  }
});

router.post('/api/author/events/:eventId/opt-out', verifyToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(404).json({ error: 'Author not found' });
    
    await prisma.eventAuthor.updateMany({
        where: { eventId, authorId: author.id },
        data: { optInStatus: 'Declined' }
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to decline invite' });
  }
});



// PUBLIC EVENTS ENDPOINT
router.get('/api/public/events', async (req, res) => {
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
                eventAuthors: { where: { optInStatus: 'Registered' } } 
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
router.get('/api/events/:eventId/catalogue', async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const event = await prisma.event.findUnique({ 
      where: { id: eventId },
      include: { galleryEvent: true }
    });
    
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

router.post('/api/admin/events', verifyToken, isAdmin, upload.single('banner'), validate(eventSchema), async (req, res) => {
  try {
    const { name, location, date, duration, startTime, endTime, eventType, registrationFee, feeType, description, livePosEnabled } = req.body;
    
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
        startTime: startTime || null,
        endTime: endTime || null,
        description: description || null,
        bannerUrl,
        status: req.body.status || (new Date(date) < new Date() ? 'Past' : 'Upcoming'),
        broadcastStatus: 'CustomersAlso',
        eventType: eventType || 'Book Fair',
        registrationFee: registrationFee ? parseFloat(registrationFee) : 0,
        feeType: feeType || 'Per Author',
        aggAuthors: req.body.aggAuthors ? parseInt(req.body.aggAuthors) : null,
        aggTitles: req.body.aggTitles ? parseInt(req.body.aggTitles) : null,
        aggSent: req.body.aggSent ? parseInt(req.body.aggSent) : null,
        aggSold: req.body.aggSold ? parseInt(req.body.aggSold) : null,
        aggRevenue: req.body.aggRevenue ? parseFloat(req.body.aggRevenue) : null,
        livePosEnabled: livePosEnabled === 'true' || livePosEnabled === true
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

router.post('/api/admin/events/:eventId/publish-all', verifyToken, isAdmin, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    await prisma.event.update({
      where: { id: eventId },
      data: { broadcastStatus: 'Published' }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/admin/events/:eventId/unpublish', verifyToken, isAdmin, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    await prisma.event.update({
      where: { id: eventId },
      data: { broadcastStatus: 'Draft' }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/admin/events/:eventId/author/:authorId/publish', async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const authorId = parseInt(req.params.authorId);
    const { booksData, registrationStatus, paymentStatus, amountPaid, useGlobalOverride, globalSold, globalRevenue, isDraft } = req.body;
    
    // Remove transaction wrapper to prevent timeouts
    const tx = prisma;
      // Upsert EventAuthor to update status
      const existingAuthor = await tx.eventAuthor.findFirst({ where: { eventId, authorId } });
      const statusValue = (registrationStatus === 'Participated' || registrationStatus === 'Registered') ? 'Registered' : 'Declined';
      const manualSold = useGlobalOverride ? parseInt(globalSold) || 0 : null;
      const manualRevenue = useGlobalOverride ? parseFloat(globalRevenue) || 0 : null;

      if (existingAuthor) {
          await tx.eventAuthor.update({
             where: { id: existingAuthor.id },
             data: { optInStatus: statusValue, manualTotalSold: manualSold, manualTotalRevenue: manualRevenue, paymentStatus: paymentStatus || null, amountPaid: amountPaid ? parseFloat(amountPaid) : null }
          });
      } else {
          await tx.eventAuthor.create({
             data: { eventId, authorId, optInStatus: statusValue, manualTotalSold: manualSold, manualTotalRevenue: manualRevenue, paymentStatus: paymentStatus || null, amountPaid: amountPaid ? parseFloat(amountPaid) : null }
          });
      }

      // Clear existing legacy manual entries for this event author
      await tx.eventBook.deleteMany({
        where: { eventId, authorId }
      });
      
      const toCreate = [];
      for (const b of booksData) {
         if (b.isSelected || parseInt(b.listedStock) > 0 || parseInt(b.soldStock) > 0) {
            toCreate.push({
               eventId,
               authorId,
               bookId: parseInt(b.bookId),
               listedStock: parseInt(b.listedStock) || 0,
               soldStock: parseInt(b.soldStock) || 0,
               returnedStock: parseInt(b.returnedStock) || 0,
               overrideMrp: b.overrideMrp ? parseFloat(b.overrideMrp) : null
            });
         }
      }
      
      if (toCreate.length > 0 && !useGlobalOverride) {
         await tx.eventBook.createMany({ data: toCreate });
      }

      // Notify the author
      const author = await tx.author.findUnique({ where: { id: authorId } });
      const event = await tx.event.findUnique({ where: { id: eventId } });
      
      if (author && event) {
        const subject = `Sales Data Published: ${event.name}`;
        const content = `<p>Dear ${author.name},</p>
        <p>Your sales and revenue data for the event <strong>${event.name}</strong> has been updated and published to your Author Dashboard.</p>
        <p>Please log in to your dashboard to view the performance breakdown and settlement details.</p>`;
        
        // Use sendNotificationEmail without await so it doesn't block the response
        if (!isDraft) {
           sendNotificationEmail(author.email, subject, emailWrap(subject, content)).catch(e => console.error('Email failed:', e));
        }
        
        await tx.notification.create({
          data: {
            message: `Your sales data for the event "${event.name}" has been published.`,
            target: author.email
          }
        });
      }
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message, stack: err.stack, details: 'Failed to publish author data' });
  }
});

router.get('/api/admin/events', verifyToken, isAdmin, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
         _count: { select: { eventAuthors: { where: { optInStatus: { not: 'Pending' } } }, eventBooks: true } },
         eventBooks: { select: { listedStock: true, soldStock: true, book: { select: { mrp: true } } } },
         galleryEvent: { include: { images: true } }
      }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.put('/api/admin/events/:id', verifyToken, isAdmin, upload.single('banner'), async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { name, location, date, duration, startTime, endTime, status, eventType, registrationFee, feeType, description, livePosEnabled, aggAuthors, aggTitles, aggSent, aggSold, aggRevenue } = req.body;
    
    let updateData = { name, location, date, duration, status };
    if (startTime !== undefined) updateData.startTime = startTime || null;
    if (endTime !== undefined) updateData.endTime = endTime || null;
    if (description !== undefined) updateData.description = description;
    if (eventType !== undefined) updateData.eventType = eventType;
    if (registrationFee !== undefined) updateData.registrationFee = parseFloat(registrationFee);
    if (feeType !== undefined) updateData.feeType = feeType;
    if (livePosEnabled !== undefined) updateData.livePosEnabled = livePosEnabled === 'true' || livePosEnabled === true;
    if (aggAuthors !== undefined) updateData.aggAuthors = parseInt(aggAuthors) || 0;
    if (aggTitles !== undefined) updateData.aggTitles = parseInt(aggTitles) || 0;
    if (aggSent !== undefined) updateData.aggSent = parseInt(aggSent) || 0;
    if (aggSold !== undefined) updateData.aggSold = parseInt(aggSold) || 0;
    if (aggRevenue !== undefined) updateData.aggRevenue = parseFloat(aggRevenue) || 0;
    
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

router.get('/api/admin/events/:id/report', verifyToken, isAdmin, async (req, res) => {
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
      if (authorBooks.length === 0 && ea.optInStatus !== 'Registered') continue;

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
        manualTotalSold: ea.manualTotalSold,
        manualTotalRevenue: ea.manualTotalRevenue,
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

router.post('/api/admin/events/:id/notify-settlement', verifyToken, isAdmin, async (req, res) => {
  res.json({ message: 'Notification emails sent to pending authors!' });
});

router.put('/api/author/events/:id/settle', verifyToken, async (req, res) => {
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

router.delete('/api/admin/events/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    await prisma.event.delete({ where: { id: eventId } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

router.post('/api/admin/events/:id/broadcast', verifyToken, isAdmin, async (req, res) => {
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




// Notifications
router.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.post('/api/admin/notifications', verifyToken, isAdmin, async (req, res) => {
  try {
    const { message, target } = req.body;
    const notification = await prisma.notification.create({
      data: {
        message,
        target: target || 'ALL'
      }
    });
    res.json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

router.delete('/api/admin/notifications/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.notification.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});


// Author: Upload image to Gallery Event
router.post('/api/author/gallery/:id/images', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { caption } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }
    
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });

    // Validate event exists
    const event = await prisma.galleryEvent.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: 'Gallery event not found' });

    // Append author name to caption automatically so Admin knows who uploaded it
    const finalCaption = caption ? `${caption} (Uploaded by ${author.name})` : `Uploaded by ${author.name}`;

    const newImage = await prisma.galleryImage.create({
      data: {
        galleryEventId: eventId,
        url: `/uploads/${req.file.filename}`,
        caption: finalCaption,
        dateTaken: new Date(),
        status: 'Pending'
      }
    });

    res.json(newImage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.delete('/api/author/gallery/images/:id', verifyToken, async (req, res) => {
  try {
    const imageId = parseInt(req.params.id);
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });

    // Ensure the image exists and belongs to the author
    const image = await prisma.galleryImage.findUnique({ where: { id: imageId } });
    if (!image) return res.status(404).json({ error: 'Image not found' });
    
    if (!image.caption || !image.caption.includes(`(Uploaded by ${author.name})`)) {
       return res.status(403).json({ error: 'You can only delete your own images' });
    }

    // Actually delete the image
    await prisma.galleryImage.delete({ where: { id: imageId } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});


// --- GALLERY ENDPOINTS ---

router.get('/api/gallery/events', async (req, res) => {
  try {
    const events = await prisma.galleryEvent.findMany({
      orderBy: { date: 'desc' },
      include: { images: true, event: true }
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gallery events' });
  }
});

router.get('/api/gallery/images', async (req, res) => {
  try {
    const { eventId } = req.query;
    const where = {};
    if (eventId) {
      where.galleryEventId = parseInt(eventId);
    }
    const images = await prisma.galleryImage.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gallery images' });
  }
});


router.get('/api/admin/gallery/pending', verifyToken, isAdmin, async (req, res) => {
  try {
    const images = await prisma.galleryImage.findMany({
      where: { status: 'Pending' },
      include: { galleryEvent: true }
    });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending images' });
  }
});

router.put('/api/admin/gallery/images/:id/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const img = await prisma.galleryImage.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'Approved' }
    });
    res.json(img);
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve image' });
  }
});

router.delete('/api/admin/gallery/images/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await prisma.galleryImage.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE IMAGE ERROR:', err);
    res.status(500).json({ error: 'Failed to reject image' });
  }
});

// Admin: Notify author of late delivery
router.post('/api/admin/authors/:id/notify-late', verifyToken, isAdmin, async (req, res) => {
  try {
    const authorId = parseInt(req.params.id);
    const { orderId, count, hours } = req.body;
    const author = await prisma.author.findUnique({ where: { id: authorId } });
    if (!author) return res.status(404).json({ error: 'Author not found' });
    
    let extraData = typeof author.extraData === 'string' ? JSON.parse(author.extraData || '{}') : (author.extraData || {});
    extraData = { ...extraData, lateNotificationDate: new Date().toISOString() };
    
    const updatedAuthor = await prisma.author.update({
      where: { id: authorId },
      data: { extraData }
    });

    if (typeof sendNotificationEmail === 'function' && typeof emailWrap === 'function') {
      const emailContent = `
        <p>Dear ${author.name},</p>
        <p>This is an automated notification from the Pune Authors' Association.</p>
        <p>You have <strong>${count || 'some'} pending unaccepted item(s)</strong> for order <strong>${orderId || 'recent orders'}</strong> that have been delayed by <strong>${hours || 'more than 24'} hours</strong>.</p>
        <p>Please log in to your Author Dashboard immediately to review and accept pending orders. Continued delays may result in fines or account suspension.</p>
      `;
      sendNotificationEmail(author.email, "Urgent: Late Delivery Notification", emailWrap("Late Delivery Notice", emailContent));
    }

    // Notifications are handled dynamically via AuthorDashboard banner

    invalidateCache('adminAuthors');
    res.json(updatedAuthor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to notify author' });
  }
});

// Admin: Charge late delivery fine
router.post('/api/admin/authors/:id/fine', verifyToken, isAdmin, async (req, res) => {
  try {
    const authorId = parseInt(req.params.id);
    const { amount, orderId, count, hours } = req.body;
    const author = await prisma.author.findUnique({ where: { id: authorId } });
    if (!author) return res.status(404).json({ error: 'Author not found' });
    
    let extraData = typeof author.extraData === 'string' ? JSON.parse(author.extraData || '{}') : (author.extraData || {});
    extraData.lateFines = (extraData.lateFines || 0) + Number(amount);
    if (!extraData.fineDate) {
      extraData.fineDate = new Date().toISOString();
    }
    
    const updatedAuthor = await prisma.author.update({
      where: { id: authorId },
      data: { extraData }
    });
    
    if (typeof sendNotificationEmail === 'function' && typeof emailWrap === 'function') {
      const emailContent = `
        <p>Dear ${author.name},</p>
        <p>A fine of <strong>₹${amount}</strong> has been charged to your account due to severe delays in dispatching orders.</p>
        ${orderId ? `<p>Specifically, you had <strong>${count || 'multiple'} items</strong> pending for order <strong>${orderId}</strong> delayed by <strong>${hours || 'more than 24'} hours</strong>.</p>` : ''}
        <p>Your account will remain suspended for new orders until this fine is cleared. Please log in to your Author Dashboard to complete the payment.</p>
      `;
      sendNotificationEmail(author.email, "Action Required: Fine Imposed for Late Delivery", emailWrap("Fine Charged", emailContent));
    }

    invalidateCache('adminAuthors');
    res.json(updatedAuthor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to apply fine' });
  }
});


router.get('/api/admin/reviews', verifyToken, isAdmin, async (req, res) => {
  try {
    const bookReviews = await prisma.bookReview.findMany({
      include: { book: { select: { title: true, author: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    const deliveryReviews = await prisma.orderItem.findMany({
      where: { feedbackRating: { not: null } },
      include: { book: { select: { title: true, author: { select: { name: true } } } }, order: { select: { customerName: true, id: true } } },
      orderBy: { deliveredAt: 'desc' }
    });
    res.json({ bookReviews, deliveryReviews });
  } catch (err) {
    console.error('Failed to fetch reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});


// Escalate order
router.post('/api/admin/orders/:id/escalate', verifyToken, isAdmin, async (req, res) => {
  try {
    // In a real system, send email via AWS SES or SendGrid here
    console.log(`[ESCALATION] Email sent to author for order item ${req.params.id}`);
    res.json({ success: true, message: "Escalation email sent to author" });
  } catch (err) {
    res.status(500).json({ error: 'Failed to escalate' });
  }
});

// Notify low stock
router.post('/api/admin/authors/:id/notify-low-stock', verifyToken, isAdmin, async (req, res) => {
  try {
    const authorId = Number(req.params.id);
    const { bookId, title } = req.body;
    const author = await prisma.author.findUnique({ where: { id: authorId } });
    if (!author) return res.status(404).json({ error: 'Author not found' });
    
    let extraData = author.extraData || {};
    let lowStockAlerts = extraData.lowStockAlerts || [];
    lowStockAlerts.push({ bookId, title, timestamp: Date.now(), read: false });
    extraData.lowStockAlerts = lowStockAlerts;
    
    await prisma.author.update({
      where: { id: authorId },
      data: { extraData }
    });
    
    invalidateCache('adminAuthors');
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to notify low stock:', err);
    res.status(500).json({ error: 'Failed to notify low stock' });
  }
});

// --- POSTAL API PROXY (bypass CORS) ---

router.get('/api/postal/state/:state', async (req, res) => {
  const https = require('https');
  const state = encodeURIComponent(req.params.state);
  const url = `https://api.postalpincode.in/postoffice/${state}`;
  
  https.get(url, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try {
        res.json(JSON.parse(data));
      } catch (e) {
        res.status(500).json({ error: 'Failed to parse postal data' });
      }
    });
  }).on('error', (err) => {
    res.status(500).json({ error: 'Failed to fetch postal data' });
  });
});

router.get('/api/postal/pincode/:pincode', async (req, res) => {
  const https = require('https');
  const pincode = encodeURIComponent(req.params.pincode);
  const url = `https://api.postalpincode.in/pincode/${pincode}`;
  
  https.get(url, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try {
        res.json(JSON.parse(data));
      } catch (e) {
        res.status(500).json({ error: 'Failed to parse postal data' });
      }
    });
  }).on('error', (err) => {
    res.status(500).json({ error: 'Failed to fetch postal data' });
  });
});

router.get('/api/postal/postoffice/:district', async (req, res) => {
  const https = require('https');
  const district = encodeURIComponent(req.params.district);
  const url = `https://api.postalpincode.in/postoffice/${district}`;
  
  https.get(url, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try {
        res.json(JSON.parse(data));
      } catch (e) {
        res.status(500).json({ error: 'Failed to parse postal data' });
      }
    });
  }).on('error', (err) => {
    res.status(500).json({ error: 'Failed to fetch postal data' });
  });
});


// ----------------- POS SYSTEM ROUTES -----------------
router.get('/api/pos/events/:eventId/pos-inventory', optionalVerifyToken, async (req, res) => {
    try {
        const eventId = parseInt(req.params.eventId);
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) return res.status(404).json({ error: 'Event not found' });
        
        const eventBooks = await prisma.eventBook.findMany({
            where: { eventId },
            include: { book: { include: { author: true } } }
        });
        
        let author = null;
        let filteredEventBooks = eventBooks;
        if (req.user && req.user.role !== 'Admin') {
            author = await prisma.author.findUnique({ where: { email: req.user.email } });
            if (author) {
                filteredEventBooks = eventBooks.filter(eb => eb.book.authorId === author.id);
            }
        }
        
        res.json({ event, eventBooks: filteredEventBooks, author });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load POS inventory' });
    }
});

router.get('/api/pos/events/:eventId/pos-sales-summary', optionalVerifyToken, async (req, res) => {
    try {
        const eventId = parseInt(req.params.eventId);
        const orders = await prisma.posOrder.findMany({
            where: { eventId, paymentStatus: 'CONFIRMED' },
            include: { items: { include: { book: true } } }
        });
        
        let totalSales = 0;
        let totalRevenue = 0;
        let todaySales = 0;
        let todayRevenue = 0;
        const bookSalesCount = {};
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (const order of orders) {
            totalRevenue += order.totalAmount;
            const isToday = new Date(order.createdAt) >= today;
            if (isToday) todayRevenue += order.totalAmount;
            
            for (const item of order.items) {
                totalSales += item.quantity;
                if (isToday) todaySales += item.quantity;
                
                if (!bookSalesCount[item.bookId]) {
                    bookSalesCount[item.bookId] = { title: item.book.title, count: 0 };
                }
                bookSalesCount[item.bookId].count += item.quantity;
            }
        }
        
        const topSellingBooks = Object.values(bookSalesCount)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
            
        res.json({ summary: { totalSales, totalRevenue, todaySales, todayRevenue, topSellingBooks } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load POS summary' });
    }
});

router.post('/api/pos/events/:eventId/pos-checkout', optionalVerifyToken, async (req, res) => {
    try {
        const eventId = parseInt(req.params.eventId);
        const { items, paymentMethod } = req.body;
        
        if (!items || items.length === 0) return res.status(400).json({ error: 'No items in cart' });
        
        await prisma.$transaction(async (tx) => {
            let totalAmount = 0;
            const orderItems = [];
            
            // We'll map the POS Order to the primary author of the first book as a generic tracking,
            // or we could make authorId nullable. For now, since schema requires authorId:
            const firstBook = await tx.book.findUnique({ where: { id: items[0].bookId } });
            const genericAuthorId = firstBook ? firstBook.authorId : 1; 

            for (const item of items) {
                const book = await tx.book.findUnique({ where: { id: item.bookId } });
                if (!book) throw new Error(`Book not found: ${item.bookId}`);
                
                const eventBook = await tx.eventBook.findFirst({
                    where: { eventId, bookId: item.bookId }
                });
                
                if (!eventBook) throw new Error(`Book not listed in this event: ${book.title}`);
                const available = eventBook.listedStock - eventBook.soldStock - eventBook.returnedStock;
                if (available < item.quantity) throw new Error(`Insufficient stock for ${book.title}`);
                
                totalAmount += book.mrp * item.quantity;
                
                await tx.eventBook.update({
                    where: { id: eventBook.id },
                    data: { soldStock: { increment: item.quantity } }
                });
                
                orderItems.push({
                    bookId: item.bookId,
                    quantity: item.quantity,
                    price: book.mrp
                });
            }
            
            await tx.posOrder.create({
                data: {
                    eventId,
                    authorId: genericAuthorId,
                    totalAmount,
                    paymentMethod: paymentMethod || 'CASH',
                    paymentStatus: 'CONFIRMED',
                    saleSource: 'BOOK_FAIR',
                    items: {
                        create: orderItems
                    }
                }
            });
        });
        
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Checkout failed' });
    }
});

router.post('/api/pos/events/:eventId/add-stock', optionalVerifyToken, async (req, res) => {
    try {
        const eventId = parseInt(req.params.eventId);
        const { bookId, quantity } = req.body;
        
        await prisma.$transaction(async (tx) => {
            const eventBook = await tx.eventBook.findFirst({ where: { eventId, bookId } });
            if (!eventBook) throw new Error('Book not in event');
            
            const book = await tx.book.findUnique({ where: { id: bookId } });
            if (book.stock < quantity) throw new Error(`Insufficient warehouse stock. Max: ${book.stock}`);
            
            // [PRE-LAUNCH] Halt Deductions
            // await tx.book.update({
            //     where: { id: bookId },
            //     data: { stock: { decrement: quantity } }
            // });
            
            await tx.eventBook.update({
                where: { id: eventBook.id },
                data: { listedStock: { increment: quantity } }
            });
        });
        
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Failed to add stock' });
    }
});
// ----------------------------------------------------

// ============================================================
// INVENTORY & DISTRIBUTION — HELPER + 3 NEW API ENDPOINTS
// ============================================================

/**
 * fireStockAlert — Fires a low-stock notification to the author + admin.
 * Has a 24-hour dedup guard to prevent notification spam.
 * Must be called OUTSIDE of Prisma transactions (uses external I/O).
 */
const fireStockAlert = async (bookId, bookTitle, author) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAlert = await prisma.notification.findFirst({
      where: {
        message: { contains: `[LOW_STOCK:${bookId}]` },
        createdAt: { gt: oneDayAgo }
      }
    });
    if (recentAlert) return; // Already alerted within 24 hours

    const alertMsg = `[LOW_STOCK:${bookId}] Low stock alert: "${bookTitle}" has fewer than 10 copies remaining.`;

    // In-app notification for the author
    await prisma.notification.create({
      data: { message: alertMsg, target: author.name }
    });
    // In-app notification for admin
    await prisma.notification.create({
      data: { message: alertMsg, target: 'ADMIN' }
    });

    // Email to author
    await sendNotificationEmail(
      author.email,
      `⚠️ Low Stock Alert — "${bookTitle}"`,
      emailWrap(`Low Inventory Warning`, `
        <p>Hi <strong>${author.name}</strong>, this is an automated alert from the PAA platform.</p>
        <p>Your book <strong>"${bookTitle}"</strong> has dropped below <strong>10 copies</strong> in your inventory.</p>
        <p>Please log in to your Author Dashboard and use the <strong>Update Stock</strong> feature to replenish your inventory before accepting new orders or registering for events.</p>
        <table>
          <tr><td><strong>Book</strong></td><td>${bookTitle}</td></tr>
          <tr><td><strong>Threshold</strong></td><td>Below 10 copies</td></tr>
        </table>
        <p style="color:#b44d28;font-weight:bold;">Action required: Update your master stock to ensure continued operations.</p>
      `)
    );
  } catch (err) {
    console.error('[fireStockAlert] Failed:', err.message);
  }
};

// Helper for Unified Ledger Calculation
async function computeBookInventory(books) {
  if (!books || books.length === 0) return [];

  const bookIds = books.map(b => b.id);

  const CUTOFF_DATE = new Date('2026-07-08T00:00:00Z');

  // Aggregate web order quantities per book (upcoming only)
  const orderItemAgg = await prisma.orderItem.groupBy({
    by: ['bookId'],
    where: { 
      bookId: { in: bookIds },
      status: { in: ['Accepted', 'Dispatched', 'Completed', 'Delivered'] },
      createdAt: { gte: CUTOFF_DATE }
    },
    _sum: { quantity: true },
    _max: { createdAt: true }
  });

  // Aggregate donation quantities per book (upcoming only)
  const donationAgg = await prisma.donationBook.groupBy({
    by: ['bookId'],
    where: { 
      bookId: { in: bookIds },
      createdAt: { gte: CUTOFF_DATE }
    },
    _sum: { quantityDonated: true },
    _max: { createdAt: true }
  });

  // Aggregate event listed stock per book — EXCLUDE Legacy Archive events
  const eventBooksRaw = await prisma.eventBook.findMany({
    where: {
      bookId: { in: bookIds },
      event: {
        status: { not: 'Legacy Archive' },
        livePosEnabled: true
      }
    },
    include: {
      event: { select: { id: true, name: true, location: true, status: true } }
    }
  });

  // Latest event activity
  const eventAgg = await prisma.eventBook.groupBy({
    by: ['bookId'],
    where: { bookId: { in: bookIds } },
    _max: { createdAt: true }
  });

  // Granular donation breakdown per book (library-level, upcoming only)
  const donationBooksRaw = await prisma.donationBook.findMany({
    where: { 
      bookId: { in: bookIds },
      createdAt: { gte: CUTOFF_DATE }
    },
    include: {
      registration: {
        include: {
          announcement: { include: { library: { select: { id: true, name: true, city: true } } } }
        }
      }
    }
  });

  // Build lookup maps
  const webSoldMap = {};
  const lastActivityMap = {};
  
  orderItemAgg.forEach(r => { 
    webSoldMap[r.bookId] = r._sum.quantity || 0; 
    if (r._max.createdAt) {
      if (!lastActivityMap[r.bookId] || r._max.createdAt > lastActivityMap[r.bookId]) {
        lastActivityMap[r.bookId] = r._max.createdAt;
      }
    }
  });

  const airportMap = {};
  donationAgg.forEach(r => { 
    airportMap[r.bookId] = r._sum.quantityDonated || 0; 
    if (r._max.createdAt) {
      if (!lastActivityMap[r.bookId] || r._max.createdAt > lastActivityMap[r.bookId]) {
        lastActivityMap[r.bookId] = r._max.createdAt;
      }
    }
  });

  eventAgg.forEach(r => {
    if (r._max.createdAt) {
      if (!lastActivityMap[r.bookId] || r._max.createdAt > lastActivityMap[r.bookId]) {
        lastActivityMap[r.bookId] = r._max.createdAt;
      }
    }
  });

  const eventMap = {};
  const eventBreakdownMap = {}; 
  eventBooksRaw.forEach(eb => {
    eventMap[eb.bookId] = (eventMap[eb.bookId] || 0) + eb.listedStock;
    if (!eventBreakdownMap[eb.bookId]) eventBreakdownMap[eb.bookId] = [];
    eventBreakdownMap[eb.bookId].push({
      type: 'event',
      label: eb.event.name,
      location: eb.event.location,
      status: eb.event.status,
      quantity: eb.listedStock,
      sold: eb.soldStock
    });
  });

  const donationBreakdownMap = {};
  donationBooksRaw.forEach(db => {
    const lib = db.registration?.announcement?.library;
    if (!donationBreakdownMap[db.bookId]) donationBreakdownMap[db.bookId] = [];
    donationBreakdownMap[db.bookId].push({
      type: 'airport',
      label: lib ? `${lib.name}${lib.city ? `, ${lib.city}` : ''}` : 'Airport Library',
      quantity: db.quantityDonated
    });
  });

  return books.map(book => {
    const webSold = webSoldMap[book.id] || 0;
    const airportQty = airportMap[book.id] || 0;
    const eventQty = eventMap[book.id] || 0;
    
    // Initial stock entered by author
    const masterStock = book.stock; 
    // Dynamically deduct upcoming data (web, airport, events)
    const currentStock = masterStock - webSold - airportQty - eventQty;

    const distributionBreakdown = [
      ...(donationBreakdownMap[book.id] || []),
      ...(eventBreakdownMap[book.id] || [])
    ];
    
    // Last activity fallback to book.createdAt
    const lastActivityDate = lastActivityMap[book.id] || book.createdAt;
    
    // Check if stale (no activity in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const isStale = new Date(lastActivityDate) < thirtyDaysAgo;

    return {
      id: book.id,
      title: book.title,
      authorName: book.author ? book.author.name : 'Unknown',
      authorId: book.authorId,
      mrp: book.mrp,
      masterStock,
      currentStock,
      webSold,
      airportQty,
      eventQty,
      lastActivity: lastActivityDate,
      isLowStock: currentStock < 10,
      isStale,
      distributionBreakdown,
      genre: book.genre,
      coverUrl: book.coverImage
    };
  });
}

// GET /api/author/inventory
// Returns per-book inventory with dynamic distribution breakdown
router.get('/api/author/inventory', verifyToken, async (req, res) => {
  try {
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });

    let books = await prisma.book.findMany({
      where: { authorId: author.id },
      orderBy: { createdAt: 'asc' }
    });
    
    // Inject authorName for the helper
    books = books.map(b => ({ ...b, authorName: author.name }));

    const enriched = await computeBookInventory(books);
    res.json(enriched);
  } catch (err) {
    console.error('[GET /api/author/inventory]', err);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});


// PUT /api/author/books/:id/stock
// Accepts positive OR negative addQty. Positive = restock, Negative = manual deduction.
router.put('/api/author/books/:id/stock', verifyToken, async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    const { addQty } = req.body;
    if (addQty === undefined || addQty === null || isNaN(parseInt(addQty)) || parseInt(addQty) === 0) {
      return res.status(400).json({ error: 'addQty must be a non-zero integer (positive to add, negative to remove)' });
    }

    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });

    const book = await prisma.book.findFirst({ where: { id: bookId, authorId: author.id } });
    if (!book) return res.status(404).json({ error: 'Book not found or not yours' });

    const qty = parseInt(addQty);
    const newStock = book.stock + qty;

    // Guard: prevent total stock going negative
    if (newStock < 0) {
      return res.status(400).json({
        error: `Stock cannot be less than zero. Current: ${book.stock}, adjustment: ${qty} → would result in ${newStock}.`
      });
    }

    const updated = await prisma.book.update({
      where: { id: bookId },
      data: { stock: newStock }
    });

    if (qty < 0 && newStock < 10 && book.stock >= 10) {
      // Negative adjustment crossed the low-stock threshold — fire alert (non-blocking)
      fireStockAlert(bookId, book.title, author).catch(() => {});
    } else if (newStock >= 10) {
      // Stock healthy — housekeep stale ADMIN low-stock notifications
      const tag = `[LOW_STOCK:${bookId}]`;
      await prisma.notification.deleteMany({
        where: { message: { contains: tag }, target: 'ADMIN' }
      }).catch(() => {});
    }

    invalidateCache(`author:dashboard:${req.user.email}`);
    res.json({ id: updated.id, title: updated.title, currentStock: updated.stock, adjustment: qty });
  } catch (err) {
    console.error('[PUT /api/author/books/:id/stock]', err);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// POST /api/author/inventory/validate-event
// Pre-registration validation: checks if requestedQty <= currentStock
router.post('/api/author/inventory/validate-event', verifyToken, async (req, res) => {
  try {
    const { bookId, requestedQty } = req.body;
    if (!bookId || !requestedQty) return res.status(400).json({ error: 'bookId and requestedQty are required' });

    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });

    const book = await prisma.book.findFirst({ where: { id: parseInt(bookId), authorId: author.id } });
    if (!book) return res.status(404).json({ error: 'Book not found' });

    const currentStock = book.stock;
    const qty = parseInt(requestedQty);
    const valid = currentStock >= qty;

    res.json({
      valid,
      currentStock,
      requestedQty: qty,
      message: valid
        ? `Sufficient stock available (${currentStock} copies).`
        : `Insufficient inventory. Please update your master inventory stock before registering. Available: ${currentStock}, Requested: ${qty}.`
    });
  } catch (err) {
    console.error('[POST /api/author/inventory/validate-event]', err);
    res.status(500).json({ error: 'Validation failed' });
  }
});

// ----------------------------------------------------
// ADMIN INVENTORY PORTAL ROUTES
// ----------------------------------------------------

// POST /api/admin/inventory/ping-author
router.post('/api/admin/inventory/ping-author', verifyToken, isAdmin, async (req, res) => {
  try {
    const { bookId, authorId } = req.body;
    const author = await prisma.author.findUnique({ where: { id: parseInt(authorId) } });
    const book = await prisma.book.findUnique({ where: { id: parseInt(bookId) } });
    
    if (!author || !book) return res.status(404).json({ error: 'Not found' });
    
    await prisma.notification.create({
      data: {
        message: `The Admin team has noticed your inventory for "${book.title}" is running low. Please update your master stock in your dashboard to ensure continued distribution.`,
        target: author.name
      }
    });

    if (author.email) {
      const emailHtml = emailWrap("Restock Request", `
        <p>Hi ${author.name},</p>
        <p>The Admin team has noticed your inventory for <strong>${book.title}</strong> is running low.</p>
        <p style="color:#b44d28;font-weight:bold;">Action required: Update your master stock in your dashboard to ensure continued distribution.</p>
      `);
      try {
        await sendNotificationEmail(author.email, `Restock Request: ${book.title}`, emailHtml);
      } catch (emailErr) {
        console.error('[POST ping-author] Email failed:', emailErr);
        return res.status(500).json({ error: 'Database updated, but failed to send email. Please verify SMTP credentials.' });
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('[POST ping-author]', err);
    res.status(500).json({ error: 'Failed to ping author' });
  }
});

// GET /api/admin/inventory
router.get('/api/admin/inventory', verifyToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', lowStock } = req.query;
    const isExport = req.query.export === 'true';
    const skip = (Number(page) - 1) * Number(limit);
    
    let whereClause = {};
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { author: { name: { contains: search } } }
      ];
    }
    
    if (lowStock === 'true') {
      whereClause.stock = { lt: 10 };
    }

    if (isExport) {
      const allBooks = await prisma.book.findMany({
        where: whereClause,
        include: { author: { select: { name: true } } },
        orderBy: { title: 'asc' }
      });
      
      const enrichedBooks = await computeBookInventory(allBooks);
      
      let csv = 'S.No,Title,Author,Master Stock,Web Sold,Airport Qty,Event Qty,Current Stock,Last Activity\n';
      enrichedBooks.forEach((b, i) => {
        const title = `"${b.title.replace(/"/g, '""')}"`;
        const authorStr = `"${b.authorName.replace(/"/g, '""')}"`;
        const date = new Date(b.lastActivity).toLocaleDateString();
        csv += `${i + 1},${title},${authorStr},${b.masterStock},${b.webSold},${b.airportQty},${b.eventQty},${b.currentStock},${date}\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=inventory_export.csv');
      return res.status(200).send(csv);
    }
    
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: whereClause,
        include: { author: { select: { name: true } } },
        orderBy: [{ stock: 'asc' }, { title: 'asc' }], // Sorting low stock first implicitly handled in DB if not dynamic frontend sort
        skip,
        take: Number(limit)
      }),
      prisma.book.count({ where: whereClause })
    ]);
    
    const enrichedBooks = await computeBookInventory(books);
    
    // Global stats across ALL platform
    const globalTotalTitles = await prisma.book.count({ where: {} });
    
    // We need to fetch all books to compute accurate global KPIs based on dynamic inventory logic
    const allBooks = await prisma.book.findMany({
      include: { author: { select: { name: true } } }
    });
    const enrichedGlobalBooks = await computeBookInventory(allBooks);
    
    const globalLowStock = enrichedGlobalBooks.filter(b => b.currentStock < 10).length;

    // Dead Stock: No activity in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const staleInventory = enrichedGlobalBooks.filter(b => new Date(b.lastActivity) < thirtyDaysAgo).length;

    // Pending Restocks: Pinged authors in the last 14 days whose books are STILL low stock
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const recentPings = await prisma.notification.findMany({
      where: {
        message: { contains: 'running low' },
        createdAt: { gte: fourteenDaysAgo }
      }
    });
    const pingedAuthorNames = new Set(recentPings.map(n => n.target));
    const pendingRestocks = enrichedGlobalBooks.filter(b => b.currentStock < 10 && pingedAuthorNames.has(b.authorName)).length;

    res.json({
      data: enrichedBooks,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        globalStats: {
          totalTitles: globalTotalTitles,
          staleInventory,
          pendingRestocks,
          globalLowStock
        }
      }
    });

  } catch (err) {
    console.error('[GET admin inventory]', err);
    res.status(500).json({ error: 'Failed to fetch admin inventory' });
  }
});

// ----------------------------------------------------
// GLOBAL SALES ANALYTICS
// ----------------------------------------------------
router.get('/api/admin/sales-analytics', verifyToken, isAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.gte = new Date(startDate);
      dateFilter.lte = new Date(endDate);
    }
    
    // 1. Fetch Web Orders
    const webOrders = await prisma.orderItem.findMany({
      where: {
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        order: { paymentVerified: true },
        status: { notIn: ['Cancelled', 'Rejected'] }
      },
      include: {
        order: { select: { customerName: true, id: true } },
        book: { select: { title: true, author: { select: { name: true } } } }
      }
    });

    // 2. Fetch POS Orders
    const posOrders = await prisma.posOrderItem.findMany({
      where: {
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        posOrder: { status: 'PAID' }
      },
      include: {
        posOrder: { select: { id: true, event: { select: { name: true } } } },
        book: { select: { title: true, author: { select: { name: true } } } }
      }
    });

    // 3. Fetch Event Manual Sales (if they have dates)
    const manualSales = await prisma.eventRegistration.findMany({
      where: {
        manualSoldQty: { gt: 0 },
        ...(Object.keys(dateFilter).length > 0 ? { updatedAt: dateFilter } : {})
      },
      include: {
        author: { select: { name: true } },
        event: { select: { name: true } }
      }
    });

    const ledger = [];
    let totalRevenue = 0;
    let totalUnits = 0;
    
    webOrders.forEach(item => {
      const revenue = item.quantity * item.price;
      totalRevenue += revenue;
      totalUnits += item.quantity;
      ledger.push({
        date: item.createdAt,
        channel: 'Web',
        refId: `ORD-${String(item.order.id).padStart(4, '0')}`,
        customer: item.order.customerName,
        title: item.book.title,
        author: item.book.author.name,
        qty: item.quantity,
        revenue: revenue
      });
    });

    posOrders.forEach(item => {
      const revenue = item.quantity * item.price;
      totalRevenue += revenue;
      totalUnits += item.quantity;
      ledger.push({
        date: item.createdAt,
        channel: 'POS',
        refId: `POS-${String(item.posOrder.id).padStart(4, '0')}`,
        customer: 'Walk-in (POS)',
        title: item.book.title,
        author: item.book.author.name,
        qty: item.quantity,
        revenue: revenue
      });
    });

    manualSales.forEach(item => {
      totalRevenue += item.manualSoldAmount || 0;
      totalUnits += item.manualSoldQty || 0;
      ledger.push({
        date: item.updatedAt || item.createdAt,
        channel: 'Manual',
        refId: `EVT-${item.eventId}`,
        customer: 'Walk-in (Manual)',
        title: 'Mixed Books',
        author: item.author.name,
        qty: item.manualSoldQty,
        revenue: item.manualSoldAmount || 0
      });
    });

    ledger.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const bookMap = {};
    const authorMap = {};
    const channelMap = { Web: 0, POS: 0, Manual: 0 };
    
    ledger.forEach(item => {
      if (channelMap[item.channel] !== undefined) {
        channelMap[item.channel] += item.revenue;
      }
      
      if (item.channel !== 'Manual') {
        if (!bookMap[item.title]) bookMap[item.title] = { title: item.title, qty: 0, revenue: 0, author: item.author };
        bookMap[item.title].qty += item.qty;
        bookMap[item.title].revenue += item.revenue;
      }
      
      if (!authorMap[item.author]) authorMap[item.author] = { author: item.author, revenue: 0, qty: 0 };
      authorMap[item.author].revenue += item.revenue;
      authorMap[item.author].qty += item.qty;
    });

    const topBooks = Object.values(bookMap).sort((a, b) => b.qty - a.qty).slice(0, 5);
    const topAuthors = Object.values(authorMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    res.json({
      totalRevenue,
      totalUnits,
      channelBreakdown: channelMap,
      topBooks,
      topAuthors,
      ledger
    });
    
  } catch (err) {
    console.error('[GET sales analytics]', err);
    res.status(500).json({ error: 'Failed to fetch sales analytics' });
  }
});

// ----------------------------------------------------
module.exports = router;
