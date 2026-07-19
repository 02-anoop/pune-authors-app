import re

path = 'src/app/components/OperationsDashboardPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix editingAuthor
content = re.sub(
    r'value=\{editingAuthor\.([a-zA-Z0-9_]+)\}',
    r"value={editingAuthor.\1 || ''}",
    content
)

# Fix editingBook
content = re.sub(
    r'value=\{editingBook\.([a-zA-Z0-9_]+)\}',
    r"value={editingBook.\1 || ''}",
    content
)

# Fix editingEvent
content = re.sub(
    r'value=\{editingEvent\.([a-zA-Z0-9_]+)\}',
    r"value={editingEvent.\1 || ''}",
    content
)

# Fix some others if present, like `q.qualification` etc which already have `|| ''`

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed null values in Modals!")
