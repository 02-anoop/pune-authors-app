import re

with open('src/app/components/OperationsDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

with open('new_overview_tab.tsx', 'r', encoding='utf-8') as f:
    new_overview = f.read()

# Find OverviewTab
start_idx = content.find("  const OverviewTab = ({ refreshTrigger }: { refreshTrigger: number }) => {")
if start_idx == -1:
    print("OverviewTab not found")
    exit(1)

# Find the end of OverviewTab (which is before WebOrdersTab)
end_idx = content.find("  const WebOrdersTab =", start_idx)

# Replace
new_content = content[:start_idx] + new_overview + "\n" + content[end_idx:]

with open('src/app/components/OperationsDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
print("OverviewTab replaced")
