import os

schema_path = "server/prisma/schema.prisma"
with open(schema_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add relation to Book
if "reviews         BookReview[]" not in content:
    content = content.replace("printFormat     String?", "printFormat     String?\n  reviews         BookReview[]")

# Add BookReview model
book_review_model = """
model BookReview {
  id           Int      @id @default(autoincrement())
  bookId       Int
  reviewerName String
  rating       Int      // 1-5
  comment      String
  createdAt    DateTime @default(now())
  book         Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
}
"""
if "model BookReview {" not in content:
    content += "\n" + book_review_model

with open(schema_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Schema patched with BookReview model")
