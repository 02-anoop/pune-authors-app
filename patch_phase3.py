import os

# --- Backend Updates ---
api_path = "server/routes/api.js"
with open(api_path, "r", encoding="utf-8") as f:
    api_content = f.read()

# Update /api/books
if "include: { author: true, reviews: true }" not in api_content and "include: { author: true, reviews: { select: { rating: true } } }" not in api_content:
    api_content = api_content.replace(
        "include: { author: true }",
        "include: { author: true, reviews: { select: { rating: true } } }"
    )

# Update /api/author/dashboard-data
if "books: { include: { reviews: true } }," not in api_content:
    api_content = api_content.replace(
        "books: true,",
        "books: { include: { reviews: true } },"
    )

# Add /api/admin/reviews
admin_reviews_api = """
router.get('/api/admin/reviews', verifyToken, isAdmin, async (req, res) => {
  try {
    const reviews = await prisma.bookReview.findMany({
      include: { book: { select: { title: true, author: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});
"""
if "/api/admin/reviews" not in api_content:
    api_content = api_content.replace("module.exports = router;", admin_reviews_api + "\nmodule.exports = router;")

with open(api_path, "w", encoding="utf-8") as f:
    f.write(api_content)
print("Backend patched")

# --- Frontend Updates: CataloguePage ---
cat_path = "src/app/components/CataloguePage.tsx"
with open(cat_path, "r", encoding="utf-8") as f:
    cat_content = f.read()

# Interface update
cat_content = cat_content.replace(
    "format?: string;\n}",
    "format?: string;\n  rating: number;\n  reviewsCount: number;\n}"
)

# Fetch mapping update
fetch_target = "format: b.format || \"\""
fetch_replace = """format: b.format || "",
          rating: b.reviews && b.reviews.length > 0 ? b.reviews.reduce((acc, r) => acc + r.rating, 0) / b.reviews.length : 0,
          reviewsCount: b.reviews ? b.reviews.length : 0"""
if "rating: b.reviews" not in cat_content:
    cat_content = cat_content.replace(fetch_target, fetch_replace)

# Mock logic update
mock_logic_target = """       // Mock logic: we don't have actual ratings in the model yet, but task says 'Add rating filters'.
       // We'll use a mocked rating for now based on title length or ID hash to demonstrate filtering, 
       // since rating logic is typically implemented with a reviews model. Let's just assume all have 4.5 for now,
       // so rating > 4.5 will match. Actually, we'll assign a deterministic mock rating for UI purposes.
       list = list.filter(b => {
          const rating = (b.title.length % 3) + 3; // Mock rating between 3 and 5
          return rating >= ratingFilter;
       });"""
mock_logic_replace = """       list = list.filter(b => b.rating >= ratingFilter);"""
if "b.rating >= ratingFilter" not in cat_content:
    cat_content = cat_content.replace(mock_logic_target, mock_logic_replace)

# UI star update
star_target = "<span style={{ fontFamily: \"var(--font-mono)\", fontSize: 11, color: \"#fff\", fontWeight: 600 }}>{(book.title.length % 3) + 3}.0</span>"
star_replace = "<span style={{ fontFamily: \"var(--font-mono)\", fontSize: 11, color: \"#fff\", fontWeight: 600 }}>{book.rating > 0 ? book.rating.toFixed(1) : 'New'}</span>"
if "{book.rating > 0" not in cat_content:
    cat_content = cat_content.replace(star_target, star_replace)

with open(cat_path, "w", encoding="utf-8") as f:
    f.write(cat_content)
print("CataloguePage patched")
