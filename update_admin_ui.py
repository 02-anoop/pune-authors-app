with open('src/app/components/OperationsDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# We need to replace the Books Sold section
old_ui = '''                      <div className="bg-paa-cream/50 p-2 rounded border border-paa-navy/10">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Books Sold</p>
                         <p className="text-lg font-black text-paa-navy">{evt._count?.eventBooks || 0}</p>
                      </div>'''

new_ui = '''                      <div className="bg-paa-cream/50 p-2 rounded border border-paa-navy/10">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Stock Listed</p>
                         <p className="text-lg font-black text-paa-navy">{evt.eventBooks?.reduce((s: number, b: any) => s + (b.listedStock || 0), 0) || 0}</p>
                      </div>'''

if old_ui in content:
    content = content.replace(old_ui, new_ui)
else:
    # Use regex
    content = re.sub(
        r'<div className="bg-paa-cream/50 p-2 rounded border border-paa-navy/10">\s*<p className="text-\[10px\] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Books Sold</p>\s*<p className="text-lg font-black text-paa-navy">\{evt\._count\?\.eventBooks \|\| 0\}</p>\s*</div>',
        new_ui,
        content
    )

with open('src/app/components/OperationsDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated OperationsDashboardPage.tsx")
