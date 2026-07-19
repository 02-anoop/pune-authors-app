import os

file_path = "server/routes/api.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# POST /api/author/books
content = content.replace(
    "edition, format, printFormat, isOverpriced } = req.body;",
    "edition, format, printFormat, isOverpriced, purpose } = req.body;"
)
content = content.replace(
    "printFormat: printFormat || null,",
    "printFormat: printFormat || null,\n        purpose: purpose || null,"
)

# PUT /api/author/books/:bookId
# Wait, I didn't put `purpose` in the destructuring for `PUT /api/author/books/:bookId`? Let's check `api.js`
# Let me just replace the entire object if it's there.
content = content.replace(
    "edition, format, printFormat } = req.body;",
    "edition, format, printFormat, purpose } = req.body;"
)
content = content.replace(
    "printFormat: printFormat",
    "printFormat: printFormat,\n            purpose: purpose"
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("api_books patched.")
