import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/server/index.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add json2csv and nodemailer initialization at top
if "const nodemailer =" not in content:
    imports = """const nodemailer = require('nodemailer');
let mailTransporter;
nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error('Failed to create a testing account. ' + err.message);
    return;
  }
  mailTransporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: { user: account.user, pass: account.pass }
  });
});

const sendNotificationEmail = async (to, subject, text) => {
  if (!mailTransporter || !to) return;
  try {
    let info = await mailTransporter.sendMail({
      from: '"Pune Authors App" <noreply@puneauthors.com>',
      to,
      subject,
      text,
    });
    console.log(`[EMAIL SENT] to ${to}: ${subject} | URL: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (err) {
    console.error("Email failed:", err);
  }
};
"""
    content = content.replace("const jwt = require('jsonwebtoken');", "const jwt = require('jsonwebtoken');\n" + imports)

# 2. Add Export Route
if "'/api/admin/orders/export'" not in content:
    export_route = """app.get('/api/admin/orders/export', verifyToken, isAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: { include: { book: { include: { author: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    const flatData = [];
    orders.forEach(o => {
      o.items.forEach(i => {
        flatData.push({
          OrderId: `ORD-${o.id}`,
          Date: o.createdAt.toISOString().split('T')[0],
          Customer: o.customerName,
          Email: o.customerEmail,
          Phone: o.customerPhone,
          Address: o.address,
          BookTitle: i.book.title,
          Author: i.book.author.name,
          Quantity: i.quantity,
          Amount: o.amount,
          PaymentStatus: o.paymentScreenshot ? 'Paid' : 'Unpaid',
          OrderStatus: i.status,
          TrackingNumber: i.trackingNumber || ''
        });
      });
    });
    const { Parser } = require('json2csv');
    const parser = new Parser();
    const csv = parser.parse(flatData);
    res.header('Content-Type', 'text/csv');
    res.attachment('orders_export.csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Export failed' });
  }
});
"""
    content = content.replace("app.get('/api/admin/orders',", export_route + "\napp.get('/api/admin/orders',")


# 3. Trigger email on Order Creation
if "await sendNotificationEmail(req.user.email" not in content:
    order_create_patch = """
    console.log(`[EMAIL MOCK] Sent order confirmation to ${req.user.email}`);
    await sendNotificationEmail(req.user.email, 'Order Confirmation - Pune Authors', `Hello ${customerName}, your order has been received and is pending payment verification.`);
"""
    content = content.replace("console.log(`[EMAIL MOCK] Sent order confirmation to ${req.user.email}`);", order_create_patch)

# 4. Trigger email on Dispatch
if "await sendNotificationEmail(orderItem.order.customerEmail" not in content:
    dispatch_patch = """
app.put('/api/order-items/:id/dispatch', verifyToken, async (req, res) => {
  try {
    const { trackingNumber } = req.body;
    const orderItem = await prisma.orderItem.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'Dispatched', trackingNumber },
      include: { order: true, book: true }
    });
    
    if (orderItem.order && orderItem.order.customerEmail) {
       await sendNotificationEmail(orderItem.order.customerEmail, 'Order Dispatched', `Your book "${orderItem.book.title}" has been dispatched. Tracking No: ${trackingNumber}`);
    }
    
    res.json(orderItem);
"""
    content = re.sub(r"app\.put\('/api/order-items/:id/dispatch',.*?res\.json\(orderItem\);", dispatch_patch, content, flags=re.DOTALL)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Features patched")
