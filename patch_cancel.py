import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/server/index.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add Cancel Route
if "'/api/orders/:id/cancel'" not in content:
    cancel_route = """
app.put('/api/orders/:id/cancel', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return res.status(404).json({ error: 'Not found' });
    if (order.customerEmail !== req.user.email) return res.status(403).json({ error: 'Forbidden' });
    
    // Only allow cancel if not dispatched
    const cannotCancel = order.items.some(i => i.status === 'Dispatched' || i.status === 'Completed');
    if (cannotCancel) return res.status(400).json({ error: 'Cannot cancel dispatched orders' });

    await prisma.order.update({ where: { id }, data: { status: 'Cancelled' } });
    await prisma.orderItem.updateMany({ where: { orderId: id }, data: { status: 'Cancelled' } });
    
    // Send email
    await sendNotificationEmail(req.user.email, 'Order Cancelled', `Your order #${id} has been cancelled successfully.`);
    
    res.json({ message: 'Order cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});
"""
    content = content.replace("app.post('/api/orders',", cancel_route + "\napp.post('/api/orders',")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Cancel route patched")
