import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/server/index.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_settle = """app.put('/api/author/events/:id/settle', verifyToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const authorId = req.user.authorId;
    const { settlements } = req.body; // Array of { eventBookId, soldStock, returnedStock }
    
    for (const settlement of settlements) {
       const eb = await prisma.eventBook.findUnique({ where: { id: settlement.eventBookId }, include: { book: true } });
       if (eb && eb.authorId === authorId && eb.eventId === eventId) {"""

new_settle = """app.put('/api/author/events/:id/settle', verifyToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const author = await prisma.author.findUnique({ where: { email: req.user.email } });
    if (!author) return res.status(404).json({ error: 'Author not found' });
    const authorId = author.id;
    const { settlements } = req.body; // Array of { eventBookId, soldStock, returnedStock }
    
    for (const settlement of settlements) {
       const eb = await prisma.eventBook.findUnique({ where: { id: settlement.eventBookId }, include: { book: true } });
       if (eb && eb.authorId === authorId && eb.eventId === eventId) {"""

if old_settle in content:
    content = content.replace(old_settle, new_settle)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
