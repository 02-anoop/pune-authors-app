import re
import os

file_path = r'c:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace bg-COLOR-500 with bg-COLOR-500/80 to dull them slightly
content = content.replace('bg-emerald-500', 'bg-emerald-500/85')
content = content.replace('bg-cyan-500', 'bg-cyan-500/85')
content = content.replace('bg-pink-500', 'bg-pink-500/85')
content = content.replace('bg-purple-500', 'bg-purple-500/85')
content = content.replace('bg-rose-500', 'bg-rose-500/85')
content = content.replace('bg-blue-500', 'bg-blue-500/85')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Colors dulled slightly.")
