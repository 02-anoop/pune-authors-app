import re

with open('server/routes/api.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("deleteCache('public-stats');", "invalidateCache('public-stats');")

with open('server/routes/api.js', 'w', encoding='utf-8') as f:
    f.write(content)
