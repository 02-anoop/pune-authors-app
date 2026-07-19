import os

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\server\routes\api.js"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

end_idx = -1
for i, line in enumerate(lines):
    if "router.post('/api/author/events/:eventId/opt-in'" in line:
        # find the end of this router
        depth = 0
        for j in range(i, len(lines)):
            if '{' in lines[j]: depth += lines[j].count('{')
            if '}' in lines[j]: depth -= lines[j].count('}')
            if depth == 0 and '});' in lines[j]:
                end_idx = j
                break
        break

if end_idx != -1:
    opt_out_code = """
router.post('/api/author/events/:eventId/opt-out', verifyToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(404).json({ error: 'Author not found' });
    
    await prisma.eventAuthor.updateMany({
        where: { eventId, authorId: author.id },
        data: { optInStatus: 'Declined' }
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to decline invite' });
  }
});
"""
    lines.insert(end_idx + 1, opt_out_code)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Added opt-out route!")
else:
    print("Could not find opt-in route end!")
