import re

with open('src/app/components/CataloguePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace the hardcoded numbers back to the dynamic 'stats' variables in the specific introduction paragraphs
# "Currently the group has approx. 50 authors." -> "Currently the group has approx. ${stats?.authors || 50} authors."
content = content.replace(
    'Currently the group has approx. 50 authors.',
    'Currently the group has approx. ${stats?.authors || 50} authors.'
)
# "There are 140 titles-books from these authors" -> "There are ${stats?.books || 140} titles-books from these authors"
content = content.replace(
    'There are 140 titles-books from these authors',
    'There are ${stats?.books || 140} titles-books from these authors'
)
# "organised nearly 34 Literary Events" -> "organised nearly ${stats?.events || 34} Literary Events"
content = content.replace(
    'organised nearly 34 Literary Events',
    'organised nearly ${stats?.events || 34} Literary Events'
)
# "donated till date 1600 copies of books" -> "donated till date ${stats?.totalDonatedBooks || 1600} copies of books"
content = content.replace(
    'donated till date 1600 copies of books',
    'donated till date ${stats?.totalDonatedBooks || 1600} copies of books'
)

with open('src/app/components/CataloguePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
