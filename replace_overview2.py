with open('src/app/components/OperationsDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find("  const OverviewTab =")
if start_idx == -1:
    print("Could not find OverviewTab start")
    exit(1)

# Find the end of OverviewTab
end_idx = content.find("  const SalesReportTab =", start_idx)

if end_idx == -1:
    print("Could not find end of OverviewTab")
    exit(1)

with open('new_overview_tab2.tsx', 'r', encoding='utf-8') as f:
    scratch_content = f.read()

# Remove the import line from scratch_content because we'll add the imports at the top
lines = scratch_content.split('\n')
if lines[0].startswith('import'):
    scratch_content = '\n'.join(lines[1:])

new_content = content[:start_idx] + scratch_content + "\n\n" + content[end_idx:]

with open('src/app/components/OperationsDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
print("OverviewTab replaced")
