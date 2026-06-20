import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/server/index.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update cancel order
old_cancel = """    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return res.status(404).json({ error: 'Not found' });
    if (order.customerEmail !== req.user.email) return res.status(403).json({ error: 'Forbidden' });
    
    // Only allow cancel if not dispatched
    const cannotCancel = order.items.some(i => i.status === 'Dispatched' || i.status === 'Completed');
    if (cannotCancel) return res.status(400).json({ error: 'Cannot cancel dispatched orders' });

    await prisma.order.update({ where: { id }, data: { status: 'Cancelled' } });
    await prisma.orderItem.updateMany({ where: { orderId: id }, data: { status: 'Cancelled' } });
    
    // Send email
    await sendNotificationEmail(req.user.email, 'Order Cancelled', `Your order #${id} has been cancelled successfully.`);"""

new_cancel = """    const order = await prisma.order.findUnique({ where: { id }, include: { items: { include: { book: { include: { author: true } } } } } });
    if (!order) return res.status(404).json({ error: 'Not found' });
    if (order.customerEmail !== req.user.email) return res.status(403).json({ error: 'Forbidden' });
    
    // Only allow cancel if not dispatched
    const cannotCancel = order.items.some(i => i.status === 'Dispatched' || i.status === 'Completed');
    if (cannotCancel) return res.status(400).json({ error: 'Cannot cancel dispatched orders' });

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
    await sendNotificationEmail(req.user.email, 'Order Cancelled', `Your order #PAA-${id.toString().padStart(4, '0')} has been cancelled successfully.`);"""

content = content.replace(old_cancel, new_cancel)

# 2. Update accept order
old_accept = """app.put('/api/order-items/:id/accept', verifyToken, async (req, res) => {
  try {
    const orderItem = await prisma.orderItem.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'Accepted' }
    });
    res.json(orderItem);"""

new_accept = """app.put('/api/order-items/:id/accept', verifyToken, async (req, res) => {
  try {
    const orderItem = await prisma.orderItem.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'Accepted' },
      include: { book: true }
    });
    // Deduct stock immediately
    if (orderItem) {
       await prisma.book.update({
         where: { id: orderItem.bookId },
         data: { stock: { decrement: orderItem.quantity } }
       });
    }
    res.json(orderItem);"""

content = content.replace(old_accept, new_accept)

# 3. Remove stock deduction from acknowledge
old_ack = """app.put('/api/order-items/:id/acknowledge', verifyToken, async (req, res) => {
  try {
    const orderItem = await prisma.orderItem.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'Completed' }
    });
    // Deduct stock
    if (orderItem) {
       await prisma.book.update({
         where: { id: orderItem.bookId },
         data: { stock: { decrement: orderItem.quantity } }
       });
    }
    res.json(orderItem);"""

new_ack = """app.put('/api/order-items/:id/acknowledge', verifyToken, async (req, res) => {
  try {
    const orderItem = await prisma.orderItem.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'Completed' }
    });
    res.json(orderItem);"""

content = content.replace(old_ack, new_ack)

# 4. Remove stock deduction from verify
old_verify = """    const order = await prisma.order.update({
      where: { id },
      data: { status: 'Completed' },
      include: { items: true }
    });
    
    // Deduct stock for all items
    for (const item of order.items) {
       await prisma.book.update({
         where: { id: item.bookId },
         data: { stock: { decrement: item.quantity } }
       });
    }
    
    res.json(order);"""

new_verify = """    const order = await prisma.order.update({
      where: { id },
      data: { status: 'Completed' },
      include: { items: true }
    });
    
    res.json(order);"""

content = content.replace(old_verify, new_verify)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Backend patched successfully")
