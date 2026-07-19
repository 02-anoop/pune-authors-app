with open('server/index.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_dash = '''app.get('/api/author/dashboard-data', verifyToken, async (req, res) => {
    try {
        const authorProfile = await prisma.author.findUnique({
            where: { email: req.user.email },
            include: { books: true, eventRegistrations: { include: { activity: true } } }
        });
        if (!authorProfile) return res.status(404).json({ error: "Author not found" });

        const authorOrders = await prisma.orderItem.findMany({
            where: { book: { authorId: authorProfile.id } },
            include: { order: true, book: true }
        });

        const formattedOrders = authorOrders.map(item => ({
            id: `ORD-${item.orderId}-${item.id}`,
            date: item.createdAt.toISOString().split('T')[0],
            customerName: item.order.customerName,
            bookTitle: item.book.title,
            quantity: item.quantity,
            amount: (item.book.mrp * item.quantity),
            status: item.status
        }));

        res.json({
            authorProfile,
            authorOrders: formattedOrders
        });'''

new_dash = '''app.get('/api/author/dashboard-data', verifyToken, async (req, res) => {
    try {
        const authorProfile = await prisma.author.findUnique({
            where: { email: req.user.email },
            include: { books: true, eventRegistrations: { include: { activity: true } } }
        });
        if (!authorProfile) return res.status(404).json({ error: "Author not found" });

        const authorOrders = await prisma.orderItem.findMany({
            where: { book: { authorId: authorProfile.id } },
            include: { order: true, book: true }
        });

        const formattedOrders = authorOrders.map(item => ({
            id: `ORD-${item.orderId}-${item.id}`,
            date: item.createdAt.toISOString().split('T')[0],
            customerName: item.order.customerName,
            bookTitle: item.book.title,
            quantity: item.quantity,
            amount: (item.book.mrp * item.quantity),
            status: item.status
        }));
        
        let dynamicFields = [];
        try {
            const settings = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'settings.json')));
            dynamicFields = settings.authorDynamicFields || [];
        } catch (e) {}

        res.json({
            authorProfile,
            authorOrders: formattedOrders,
            dynamicFields
        });'''

content = content.replace(old_dash, new_dash)

with open('server/index.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated /api/author/dashboard-data with dynamicFields")
