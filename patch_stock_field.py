import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/server/index.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_code = """             // Add returned stock back to inventory
             await prisma.book.update({
                where: { id: eb.bookId },
                data: { availableStock: eb.book.availableStock + settlement.returnedStock }
             });"""

new_code = """             // Add returned stock back to inventory
             await prisma.book.update({
                where: { id: eb.bookId },
                data: { stock: eb.book.stock + settlement.returnedStock }
             });"""

if old_code in content:
    content = content.replace(old_code, new_code)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
