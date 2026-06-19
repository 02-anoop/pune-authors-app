with open('server/index.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add public events endpoint
public_events_code = '''
// PUBLIC EVENTS ENDPOINT
app.get('/api/public/events', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { broadcastStatus: 'CustomersAlso' },
          { broadcastStatus: 'AuthorsOnly' } // let's show all active events? Or just CustomersAlso? Let's show CustomersAlso
        ]
      },
      include: {
         _count: { select: { eventBooks: true, eventAuthors: true } }
      },
      orderBy: { id: 'desc' }
    });
    // Actually let's just fetch all events that are CustomersAlso
    const publicEvents = events.filter(e => e.broadcastStatus === 'CustomersAlso');
    res.json(publicEvents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch public events' });
  }
});
'''

if '/api/public/events' not in content:
    content = content.replace('// GET PUBLIC EVENT CATALOGUE', public_events_code + '\n// GET PUBLIC EVENT CATALOGUE')

with open('server/index.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added public events endpoint")
