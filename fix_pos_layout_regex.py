import os
import re

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\LivePosDashboard.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix loading skeleton wrapper
# Old: <div className="flex flex-col h-screen bg-gray-50 overflow-hidden fixed inset-0 z-[200]"> (or similar)
content = re.sub(
    r'<div className="flex flex-col[^"]*fixed inset-0 z-\[200\]">',
    r'<div className="flex flex-col bg-gray-50 overflow-hidden rounded-2xl border shadow-sm h-[calc(100vh-140px)] w-full relative">',
    content
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("POS layout fixed successfully.")
