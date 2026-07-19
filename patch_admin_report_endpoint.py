import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/server/index.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

endpoint_code = """
// Admin: Get Event Report (Sales, Revenue, etc)
app.get('/api/admin/events/:id/report', verifyToken, isAdmin, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const eventBooks = await prisma.eventBook.findMany({
      where: { eventId },
      include: {
        author: { select: { name: true, email: true } },
        book: { select: { title: true, mrp: true } }
      }
    });
    res.json(eventBooks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch event report' });
  }
});
"""

if "// Admin: Get Event Report" not in content:
    content = content.replace(
        "// Admin: Get Event Catalogue",
        endpoint_code + "\n// Admin: Get Event Catalogue"
    )

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
