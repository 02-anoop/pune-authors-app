with open('server/index.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_admin_events = '''app.get('/api/admin/events', verifyToken, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
         _count: { select: { eventAuthors: true, eventBooks: true } }
      }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});'''

new_admin_events = '''app.get('/api/admin/events', verifyToken, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
         _count: { select: { eventAuthors: true, eventBooks: true } },
         eventBooks: { select: { listedStock: true } }
      }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});'''

content = content.replace(old_admin_events, new_admin_events)

with open('server/index.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated admin events endpoint")
