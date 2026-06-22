import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/server/prisma/schema.prisma"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add relation to User model
if "queries   Query[]" not in content:
    content = content.replace(
        "phone     String?\n}",
        "phone     String?\n  queries   Query[]\n}"
    )

# Update Query model to support both Authors and Customers
old_query = """model Query {
  id          Int      @id @default(autoincrement())
  authorId    Int
  subject     String
  message     String
  status      String   @default("Pending") // Pending, Answered
  reply       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  author      Author   @relation(fields: [authorId], references: [id], onDelete: Cascade)
}"""

new_query = """model Query {
  id          Int      @id @default(autoincrement())
  authorId    Int?
  userId      Int?
  subject     String
  message     String
  status      String   @default("Pending") // Pending, Answered
  reply       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  author      Author?   @relation(fields: [authorId], references: [id], onDelete: Cascade)
  user        User?     @relation(fields: [userId], references: [id], onDelete: Cascade)
}"""

if "userId      Int?" not in content:
    content = content.replace(old_query, new_query)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
