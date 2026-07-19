import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = r'c:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old = "transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#ebd8c0]'} hover:bg-[#ebd8c0] ${expandedEventId"
new = "transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#ebd8c0]'} ${expandedEventId"

if old in content:
    content = content.replace(old, new, 1)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Done - hover removed from events table row')
else:
    print('Pattern not found!')
    # Show line 4391 raw bytes for debugging
    lines = content.splitlines()
    print(repr(lines[4390]))
