import os

author_path = "src/app/components/AuthorDashboardPage.tsx"
with open(author_path, "r", encoding="utf-8") as f:
    author_content = f.read()

import_target = "Image as ImageIcon } from 'lucide-react';"
import_replace = "Image as ImageIcon, Star } from 'lucide-react';"
if "Star" not in import_target and "Star" not in author_content.split("from 'lucide-react';")[0]:
    author_content = author_content.replace(import_target, import_replace)

with open(author_path, "w", encoding="utf-8") as f:
    f.write(author_content)
print("Added Star import to AuthorDashboardPage")
