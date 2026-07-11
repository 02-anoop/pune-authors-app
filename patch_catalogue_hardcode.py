import re

with open('src/app/components/CataloguePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('${stats?.authors || 50}', '50')
content = content.replace('${stats?.books || 140}', '140')
content = content.replace('${stats?.events || 34}', '34')
content = content.replace('${stats?.totalDonatedBooks || 1600}', '1600')

with open('src/app/components/CataloguePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
