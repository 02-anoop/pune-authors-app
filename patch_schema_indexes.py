import os
import re

schema_path = r"c:\Users\arvin\Desktop\pune-authors-app\server\prisma\schema.prisma"

with open(schema_path, "r", encoding="utf-8") as f:
    content = f.read()

# Adding Indexes
# In User model, index role and email
content = re.sub(r'(model User \{[^}]*?phone\s+String\?\n\s+queries\s+Query\[\])(\n\})', r'\1\n  @@index([role])\n  @@index([email])\2', content)

# In Author model, index status, email
content = re.sub(r'(model Author \{[^}]*?EventBook\[\])(\n\})', r'\1\n  @@index([status])\n  @@index([email])\2', content)

# In Book model, index authorId, status
content = re.sub(r'(model Book \{[^}]*?EventBook\[\])(\n\})', r'\1\n  @@index([authorId])\n  @@index([status])\n  @@index([genre])\2', content)

# In Order model, index status, customerEmail
content = re.sub(r'(model Order \{[^}]*?items\s+OrderItem\[\])(\n\})', r'\1\n  @@index([status])\n  @@index([customerEmail])\n  @@index([createdAt])\2', content)

# In PosOrder model, index eventId
content = re.sub(r'(model PosOrder \{[^}]*?items\s+PosOrderItem\[\])(\n\})', r'\1\n  @@index([eventId])\n  @@index([createdAt])\2', content)

with open(schema_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Indexes added to schema.prisma")
