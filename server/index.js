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
