const fs = require('fs');
let content = fs.readFileSync('server/routes/api.js', 'utf8');

const authorGalleryEndpoints = `
// Author: Upload image to Gallery Event
router.post('/api/author/gallery/:id/images', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { caption } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }
    
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(403).json({ error: 'Not an author' });

    // Validate event exists
    const event = await prisma.galleryEvent.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: 'Gallery event not found' });

    // Append author name to caption automatically so Admin knows who uploaded it
    const finalCaption = caption ? \`\${caption} (Uploaded by \${author.name})\` : \`Uploaded by \${author.name}\`;

    const newImage = await prisma.galleryImage.create({
      data: {
        galleryEventId: eventId,
        url: \`/uploads/\${req.file.filename}\`,
        caption: finalCaption,
        dateTaken: new Date()
      }
    });

    res.json(newImage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});
`;

if (!content.includes('/api/author/gallery/:id/images')) {
  content = content.replace('module.exports = router;', authorGalleryEndpoints + '\nmodule.exports = router;');
  fs.writeFileSync('server/routes/api.js', content);
}
console.log('Added Author Gallery backend endpoints');
