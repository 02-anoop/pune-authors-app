import os

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\server\routes\api.js"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "router.get('/api/admin/dashboard-stats', verifyToken, isAdmin, async (req, res) => {"
# The endpoint ends around 140 lines later. We will find "res.json(result);"
# and the closing "});"
start_idx = content.find(start_marker)

if start_idx != -1:
    end_str = "    res.status(500).json({ error: 'Failed' });\n  }\n});"
    end_idx = content.find(end_str, start_idx)
    
    if end_idx != -1:
        end_idx += len(end_str)
        
        # We will replace the entire route block
        optimized_route = """router.get('/api/admin/dashboard-stats', verifyToken, isAdmin, async (req, res) => {
  const cached = getCache('admin:dashboard-stats');
  if (cached) return res.json(cached);
  try {
    const totalAuthors = await prisma.author.count();
    const totalBooks = await prisma.book.count();
    
    const [eventParticipations, pendingEventRegistrations] = await Promise.all([
      prisma.eventAuthor.count({ where: { optInStatus: 'Opted-In' } }),
      prisma.eventAuthor.count({ where: { optInStatus: 'Awaiting Approval' } })
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
      include: { author: true },
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
});"""
        
        new_content = content[:start_idx] + optimized_route + content[end_idx:]
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print("Successfully optimized dashboard-stats route!")
    else:
        print("End marker not found")
else:
    print("Start marker not found")
