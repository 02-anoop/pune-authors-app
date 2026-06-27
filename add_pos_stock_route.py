import os

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\server\routes\pos.js"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

add_stock_route = """

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

"""

content = content.replace("router.get('/api/author/events/:eventId/pos-inventory'", add_stock_route + "router.get('/api/author/events/:eventId/pos-inventory'")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Add stock route added to pos.js.")
