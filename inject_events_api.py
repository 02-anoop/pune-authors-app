with open('server/index.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_routes = '''
// --- EVENTS MANAGEMENT (PHASE 1) ---

app.post('/api/admin/events', verifyToken, async (req, res) => {
  try {
    const { name, location, date, duration } = req.body;
    const event = await prisma.event.create({
      data: { name, location, date, duration, status: 'Upcoming' }
    });
    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

app.get('/api/admin/events', verifyToken, async (req, res) => {
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
});

app.post('/api/admin/events/:id/broadcast', verifyToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { target } = req.body; // 'Authors' or 'Customers'
    
    if (target === 'Authors') {
       await prisma.event.update({
         where: { id: eventId },
         data: { broadcastStatus: 'AuthorsOnly' }
       });
       
       // Here NodeMailer logic would go to email authors
       // For now we just create EventAuthor records for all Active authors
       const activeAuthors = await prisma.author.findMany({ where: { status: 'Active' } });
       const eventAuthorsData = activeAuthors.map(a => ({ eventId, authorId: a.id, optInStatus: 'Pending' }));
       await prisma.eventAuthor.createMany({ data: eventAuthorsData, skipDuplicates: true });
       
       res.json({ success: true, message: 'Broadcast sent to authors. Opt-in requests created.' });
    } else if (target === 'Customers') {
       await prisma.event.update({
         where: { id: eventId },
         data: { broadcastStatus: 'CustomersAlso' }
       });
       res.json({ success: true, message: 'Catalogue generated and broadcasted to customers!' });
    } else {
       res.status(400).json({ error: 'Invalid broadcast target' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Broadcast failed' });
  }
});

'''

content = content.replace('app.listen(PORT', new_routes + 'app.listen(PORT')

with open('server/index.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Injected event APIs into server/index.js")
