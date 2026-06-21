import sys
import re

with open('server/index.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_endpoints = """
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

"""

# Insert right before // --- FORMS MANAGEMENT ---
target_str = "// --- FORMS MANAGEMENT ---"
if target_str in content:
    content = content.replace(target_str, new_endpoints + target_str)
    print("Endpoints added to server/index.js")
else:
    print("Could not find insertion point in server/index.js")

with open('server/index.js', 'w', encoding='utf-8') as f:
    f.write(content)
