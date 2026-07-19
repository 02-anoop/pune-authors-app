import os

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\server\routes\api.js"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

pos_routes = """
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
        
        const mappedBooks = eventBooks.map(eb => ({
            id: eb.id,
            bookId: eb.book.id,
            title: eb.book.title,
            authorName: eb.book.author?.name || 'Unknown',
            isbn: eb.book.isbn,
            mrp: eb.book.mrp,
            stock: eb.listedStock - eb.soldStock - eb.returnedStock,
            coverImage: eb.book.coverImage || '/placeholder-book.png'
        }));
        
        res.json({ event, books: mappedBooks });
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
        const bookSalesCount: Record<number, { title: string, count: number }> = {};
        
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
                    unitPrice: book.mrp,
                    subtotal: book.mrp * item.quantity
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
            
            await tx.book.update({
                where: { id: bookId },
                data: { stock: { decrement: quantity } }
            });
            
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
"""

# Insert the POS routes near the end before module.exports
end_idx = -1
for i in range(len(lines)-1, -1, -1):
    if "module.exports = router;" in lines[i]:
        end_idx = i
        break

if end_idx != -1:
    lines.insert(end_idx, pos_routes)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Added POS routes to api.js!")
else:
    print("Failed to find module.exports in api.js")
