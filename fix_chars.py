import io

with io.open('src/app/components/OperationsDashboardPage.tsx', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'Click to Unpublish' in line and 'PUBLISHED' in line:
        lines[i] = '                                   <CheckCircle2 className="w-4 h-4 text-emerald-600" /> PUBLISHED &bull; Click to Unpublish\n'
        break

with io.open('src/app/components/OperationsDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
