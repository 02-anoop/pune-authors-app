const fs = require('fs');
let content = fs.readFileSync('server/routes/api.js', 'utf8');

const notifEndpoints = `

// Notifications
router.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.post('/api/admin/notifications', verifyToken, isAdmin, async (req, res) => {
  try {
    const { message, target } = req.body;
    const notification = await prisma.notification.create({
      data: {
        message,
        target: target || 'ALL'
      }
    });
    res.json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

router.delete('/api/admin/notifications/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.notification.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});
`;

if (!content.includes('/api/admin/notifications')) {
  content = content.replace('module.exports = router;', notifEndpoints + '\nmodule.exports = router;');
  fs.writeFileSync('server/routes/api.js', content);
}
console.log('Added notifications backend endpoints');
