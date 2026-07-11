import re

with open('server/routes/api.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update /api/public-stats to fetch system settings
public_stats_original = """    const events = await prisma.event.count();
    const libraries = await prisma.library.count();
    
    // Total donated books
    const donationAgg = await prisma.donationBook.aggregate({
      _sum: { quantityDonated: true }
    });
    const totalDonatedBooks = donationAgg._sum.quantityDonated || 1400; // fallback if null

    // For fairs, if we don't have a specific tag, we can just use 3 or derive it.
    const fairs = 3; 
    
    const stats = { authors: authors, books: books, categories: categories, events: events, fairs: fairs, airportLibraries: libraries, totalDonatedBooks };"""

public_stats_new = """    const events = await prisma.event.count();
    const libraries = await prisma.library.count();
    
    // Total donated books
    const donationAgg = await prisma.donationBook.aggregate({
      _sum: { quantityDonated: true }
    });
    const totalDonatedBooks = donationAgg._sum.quantityDonated || 1400; // fallback if null

    // For fairs, if we don't have a specific tag, we can just use 3 or derive it.
    const fairs = 3; 

    // Fetch system settings for manual overrides
    const rawSettings = await prisma.systemSetting.findMany({
      where: { key: { in: ['manualAuthorsCount', 'manualBooksCount', 'manualEventsCount', 'manualDonatedBooksCount'] } }
    });
    const settingsMap = {};
    rawSettings.forEach(s => settingsMap[s.key] = s.value);

    const stats = { 
      authors: settingsMap['manualAuthorsCount'] ? parseInt(settingsMap['manualAuthorsCount']) : authors, 
      books: settingsMap['manualBooksCount'] ? parseInt(settingsMap['manualBooksCount']) : books, 
      categories: categories, 
      events: settingsMap['manualEventsCount'] ? parseInt(settingsMap['manualEventsCount']) : events, 
      fairs: fairs, 
      airportLibraries: libraries, 
      totalDonatedBooks: settingsMap['manualDonatedBooksCount'] ? parseInt(settingsMap['manualDonatedBooksCount']) : totalDonatedBooks 
    };"""

content = content.replace(public_stats_original, public_stats_new)

# 2. Add /api/admin/settings endpoints
admin_settings = """
// ── SYSTEM SETTINGS ────────────────────────────────────────────────────────────

router.get('/api/admin/settings', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  try {
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = {};
    settings.forEach(s => settingsMap[s.key] = s.value);
    res.json(settingsMap);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.post('/api/admin/settings', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  try {
    const settings = req.body;
    
    // Process each key-value pair and upsert in the database
    const updates = Object.entries(settings).map(async ([key, value]) => {
      if (value === null || value === undefined || value === '') {
        // If empty, delete the setting so it falls back to dynamic
        return prisma.systemSetting.deleteMany({ where: { key } }).catch(() => {});
      } else {
        return prisma.systemSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) }
        });
      }
    });
    
    await Promise.all(updates);
    
    // Clear public stats cache
    deleteCache('public-stats');

    res.json({ success: true });
  } catch (error) {
    console.error("Failed to save settings:", error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

"""

# Insert before "module.exports = router;"
content = content.replace('module.exports = router;', admin_settings + '\nmodule.exports = router;')

with open('server/routes/api.js', 'w', encoding='utf-8') as f:
    f.write(content)
