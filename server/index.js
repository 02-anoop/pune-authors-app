require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const posRoutes = require('./routes/pos');
const formsRoutes = require('./routes/forms');
const queriesRoutes = require('./routes/queries');
const apiRoutes = require('./routes/api');
const donationsRoutes = require('./routes/donations');

app.use('/api/auth', authRoutes);
app.use('/', posRoutes);
app.use('/', formsRoutes);
app.use('/', queriesRoutes);
app.use('/', donationsRoutes);

// Main legacy routes aggregator mounted at root since paths inside have full prefix like /api/admin/...
app.use('/', apiRoutes);

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendNotificationEmail, emailWrap } = require('./utils/email');

// Auto-Delivery Background Interval (Runs every hour)
setInterval(async () => {
  try {
    const now = new Date();
    const expiredOrders = await prisma.orderItem.findMany({
      where: {
        status: 'Dispatched',
        dispatchedAt: { lt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) }
      }
    });

    if (expiredOrders.length > 0) {
      console.log(`Auto-delivering ${expiredOrders.length} orders...`);
      for (const order of expiredOrders) {
        await prisma.orderItem.update({
          where: { id: order.id },
          data: {
            status: 'Delivered',
            autoDelivered: true,
            deliveredAt: now
          }
        });
      }
    }

    // Auto-Verify Orders (3 days after delivery)
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const unverifiedOrders = await prisma.order.findMany({
      where: { status: 'Pending Verification' },
      include: { items: true }
    });

    for (const order of unverifiedOrders) {
      if (!order.items || order.items.length === 0) continue;
      
      const hasDeliveredItems = order.items.some(item => item.status === 'Delivered');
      const isReadyForVerify = order.items.every(item => {
        if (item.status === 'Rejected') return true;
        if (item.status === 'Delivered' && item.deliveredAt && item.deliveredAt < threeDaysAgo) return true;
        return false;
      });

      if (hasDeliveredItems && isReadyForVerify) {
        console.log(`Auto-verifying order ${order.id}...`);
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'Completed' }
        });
      }
    }

    // Daily Admin Report for Late Authors (runs at 9 AM)
    if (now.getHours() === 9 && (!global.lastLateReportSent || global.lastLateReportSent.getDate() !== now.getDate())) {
      global.lastLateReportSent = now;
      const lateItems = await prisma.orderItem.findMany({
        where: {
          status: { in: ['Pending', 'Pending Verification', 'Accepted'] },
          createdAt: { lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
        },
        include: { author: true, order: true, book: true }
      });
      
      const actuallyLate = lateItems.filter(it => {
        const hours = (now.getTime() - new Date(it.createdAt).getTime()) / (1000 * 3600);
        if ((it.status === 'Pending Verification' || it.status === 'Pending') && hours > 24) return true;
        if (it.status === 'Accepted' && hours > 48) return true;
        return false;
      });

      if (actuallyLate.length > 0) {
        let html = `<p>Admin,</p><p>There are ${actuallyLate.length} delayed order items requiring attention.</p><ul>`;
        actuallyLate.forEach(it => {
          html += `<li><strong>Order ${it.orderId || (it.order && it.order.id)}</strong> - Author: ${it.authorName || (it.author && it.author.name) || 'Unknown'} - Item: ${it.book ? it.book.title : 'Unknown'} - Status: ${it.status}</li>`;
        });
        html += `</ul><p>Please check the Operations Dashboard to issue warnings or fines.</p>`;
        
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@puneauthors.com';
        await sendNotificationEmail(adminEmail, 'Daily Late Authors Report', emailWrap('Late Authors Report', html))
          .catch(e => console.error('Failed to send daily report', e));
      }
    }
  } catch (error) {
    console.error('Auto-delivery interval error:', error);
  }
}, 60 * 60 * 1000); // 1 hour

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

// Trigger nodemon restart

// Trigger nodemon restart 3
