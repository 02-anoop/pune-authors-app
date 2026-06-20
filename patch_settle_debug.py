import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/server/index.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_settle_loop = """    for (const settlement of settlements) {
       const eb = await prisma.eventBook.findUnique({ where: { id: settlement.eventBookId }, include: { book: true } });
       if (eb && eb.authorId === authorId && eb.eventId === eventId) {
          // Verify they haven't already settled this book
          if (eb.listedStock !== eb.soldStock + eb.returnedStock) {"""

new_settle_loop = """    for (const settlement of settlements) {
       console.log('Processing settlement:', settlement);
       const eb = await prisma.eventBook.findUnique({ where: { id: settlement.eventBookId }, include: { book: true } });
       console.log('Found EventBook:', !!eb, 'author match:', eb?.authorId === authorId, 'event match:', eb?.eventId === eventId);
       if (eb && eb.authorId === authorId && eb.eventId === eventId) {
          // Verify they haven't already settled this book
          console.log('Stock Check. listed:', eb.listedStock, 'sold:', eb.soldStock, 'returned:', eb.returnedStock);
          if (eb.listedStock !== eb.soldStock + eb.returnedStock) {"""

if old_settle_loop in content:
    content = content.replace(old_settle_loop, new_settle_loop)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
