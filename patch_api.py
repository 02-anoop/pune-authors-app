import re

with open('server/routes/api.js', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to find the `let dynamicFields = [];` and replace the mess after it up to `const bookId = parseInt(req.params.id);`

start_marker = "    let dynamicFields = [];"
end_marker = "    const bookId = parseInt(req.params.id);"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    correct_content = """    let dynamicFields = [];
    try {
      const p = require('path').join(__dirname, 'settings.json');
      if (require('fs').existsSync(p)) {
        const settings = JSON.parse(require('fs').readFileSync(p));
        dynamicFields = settings.authorDynamicFields || [];
      }
    } catch(e) {}

    const eventInvites = await prisma.eventAuthor.findMany({
      where: { authorId: authorProfile.id },
      include: { event: true }
    });
    const listedBooks = await prisma.eventBook.findMany({
      where: { authorId: authorProfile.id }
    });
    const posOrders = await prisma.posOrder.findMany({
      where: { authorId: authorProfile.id },
      include: { items: { include: { book: true } } }
    });
    const notifications = await prisma.notification.findMany({
      where: { OR: [{ target: 'ALL' }, { target: authorProfile.name }, { target: `@${authorProfile.name}` }] },
      orderBy: { createdAt: 'desc' }
    });
    const result = { authorProfile, authorOrders, dynamicFields, eventInvites, listedBooks, posOrders, notifications };
    setCache(cacheKey, result, 20 * 1000); // 20s cache for dashboard
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Update Book Inventory (Stock)
router.put('/api/author/inventory/:id', verifyToken, async (req, res) => {
  try {
"""
    new_content = content[:start_idx] + correct_content + content[end_idx:]
    with open('server/routes/api.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Fixed!")
else:
    print("Markers not found.")
