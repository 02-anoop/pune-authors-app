with open('server/index.js', 'r', encoding='utf-8') as f:
    content = f.read()

author_event_routes = '''
// --- AUTHOR EVENTS MANAGEMENT ---
app.get('/api/author/events', verifyToken, async (req, res) => {
  try {
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(404).json({ error: 'Author not found' });

    const eventInvites = await prisma.eventAuthor.findMany({
      where: { authorId: author.id },
      include: { event: true }
    });
    
    // Get books to list
    const books = await prisma.book.findMany({ where: { authorId: author.id, status: 'Active' }});
    
    // Get currently listed books for this author across events
    const listedBooks = await prisma.eventBook.findMany({ where: { authorId: author.id } });

    res.json({ eventInvites, books, listedBooks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.post('/api/author/events/:eventId/opt-in', verifyToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { booksToLink } = req.body; // Array of { bookId, listedStock }
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    
    // Update optInStatus
    await prisma.eventAuthor.updateMany({
      where: { eventId, authorId: author.id },
      data: { optInStatus: 'Opted-In' }
    });
    
    // Insert EventBook records
    for (const b of booksToLink) {
       await prisma.eventBook.upsert({
          where: { id: -1 }, // hack to always create if we don't have unique constraint, wait, better createMany
       })
    }
  } catch(error) {}
});
'''

# Wait, the `upsert` hack is bad. Let's write proper logic.
author_event_routes = '''
// --- AUTHOR EVENTS MANAGEMENT ---
app.get('/api/author/events', verifyToken, async (req, res) => {
  try {
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(404).json({ error: 'Author not found' });

    const eventInvites = await prisma.eventAuthor.findMany({
      where: { authorId: author.id },
      include: { event: true }
    });
    
    const books = await prisma.book.findMany({ where: { authorId: author.id, status: 'Active' }});
    const listedBooks = await prisma.eventBook.findMany({ where: { authorId: author.id } });

    res.json({ eventInvites, books, listedBooks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.post('/api/author/events/:eventId/opt-in', verifyToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { booksToLink } = req.body; // Array of { bookId, stock }
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    
    await prisma.eventAuthor.updateMany({
      where: { eventId, authorId: author.id },
      data: { optInStatus: 'Opted-In' }
    });
    
    // Remove old mappings for this event/author and recreate
    await prisma.eventBook.deleteMany({ where: { eventId, authorId: author.id } });
    
    if (booksToLink && booksToLink.length > 0) {
       const eventBooksData = booksToLink.map((b) => ({
          eventId,
          authorId: author.id,
          bookId: parseInt(b.bookId),
          listedStock: parseInt(b.stock)
       }));
       await prisma.eventBook.createMany({ data: eventBooksData });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to opt in' });
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
'''

content = content.replace('// --- EVENTS MANAGEMENT (PHASE 1) ---', author_event_routes + '\n// --- EVENTS MANAGEMENT (PHASE 1) ---')

with open('server/index.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Injected author events APIs")
