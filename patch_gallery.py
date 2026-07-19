import os

schema_path = "server/prisma/schema.prisma"
api_path = "server/routes/api.js"

with open(schema_path, "r", encoding="utf-8") as f:
    schema = f.read()

if "status          String   @default(\"Pending\")" not in schema and "model GalleryImage" in schema:
    schema = schema.replace(
        "  caption         String?\n  dateTaken       DateTime?\n  createdAt       DateTime @default(now())",
        "  caption         String?\n  dateTaken       DateTime?\n  createdAt       DateTime @default(now())\n  status          String   @default(\"Pending\")"
    )
    with open(schema_path, "w", encoding="utf-8") as f:
        f.write(schema)
    print("Patched schema.prisma")

api_endpoints = """
// --- GALLERY ENDPOINTS ---

router.get('/api/gallery/events', async (req, res) => {
  try {
    const events = await prisma.galleryEvent.findMany({
      orderBy: { date: 'desc' }
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gallery events' });
  }
});

router.post('/api/author/gallery/:id/images', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { caption } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No image provided' });
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });
    const finalCaption = caption ? `${caption} (Uploaded by ${author.name})` : `Uploaded by ${author.name}`;
    const newImage = await prisma.galleryImage.create({
      data: {
        galleryEventId: eventId,
        url: `/uploads/${req.file.filename}`,
        caption: finalCaption,
        status: "Pending"
      }
    });
    res.json(newImage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.get('/api/admin/gallery/pending', verifyToken, isAdmin, async (req, res) => {
  try {
    const images = await prisma.galleryImage.findMany({
      where: { status: 'Pending' },
      include: { galleryEvent: true }
    });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending images' });
  }
});

router.put('/api/admin/gallery/images/:id/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const img = await prisma.galleryImage.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'Approved' }
    });
    res.json(img);
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve image' });
  }
});

router.delete('/api/admin/gallery/images/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await prisma.galleryImage.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject image' });
  }
});
"""

with open(api_path, "r", encoding="utf-8") as f:
    api_content = f.read()

if "/api/gallery/events" not in api_content:
    api_content = api_content.replace("module.exports = router;", api_endpoints + "\nmodule.exports = router;")
    with open(api_path, "w", encoding="utf-8") as f:
        f.write(api_content)
    print("Patched api.js")
