import os
import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/server/index.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add isAdmin middleware
is_admin_code = """
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
};
"""
if "const isAdmin" not in content:
    content = content.replace("const verifyToken =", is_admin_code + "\nconst verifyToken =")

# 2. Add verifyToken and isAdmin to admin routes
# We'll use a regex to inject them safely
import re
def inject_middlewares(match):
    method = match.group(1)
    route = match.group(2)
    rest = match.group(3)
    
    if "verifyToken" in rest and "isAdmin" in rest:
        return match.group(0)
    
    # If verifyToken is there but not isAdmin
    if "verifyToken" in rest and "isAdmin" not in rest:
        rest = rest.replace("verifyToken,", "verifyToken, isAdmin,")
        return f"app.{method}('{route}', {rest}"
    
    # If neither is there
    return f"app.{method}('{route}', verifyToken, isAdmin, {rest}"

content = re.sub(r"app\.(get|post|put|delete)\('(/api/admin/[^']+)',\s*(.*?async\s*\(req)", inject_middlewares, content)
content = re.sub(r"app\.(get|post|put|delete)\('(/api/admin/[^']+)',\s*(.*?\(\s*req)", inject_middlewares, content)


# 3. Add inventory deduction on order completion/dispatch
# Look for /api/order-items/:id/acknowledge -> status: 'Completed'
# Look for /api/admin/orders/:id/verify -> status: 'Completed'

acknowledge_block = """app.put('/api/order-items/:id/acknowledge', verifyToken, async (req, res) => {
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
    res.json(orderItem);
"""
content = re.sub(r"app\.put\('/api/order-items/:id/acknowledge'.*?res\.json\(orderItem\);", acknowledge_block, content, flags=re.DOTALL)

verify_block = """app.post('/api/admin/orders/:id/verify', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = await prisma.order.update({
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
    
    res.json(order);
"""
content = re.sub(r"app\.post\('/api/admin/orders/:id/verify'.*?res\.json\(order\);", verify_block, content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Backend patched.")
