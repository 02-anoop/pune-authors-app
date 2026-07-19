import re

with open('src/app/components/OperationsDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add MessageSquare import
content = re.sub(r'import \{(.*?)\} from "lucide-react";', r'import {\1, MessageSquare} from "lucide-react";', content)

with open('scratch_overview.txt', 'r', encoding='utf-8') as f:
    scratch_content = f.read()

# Replace "const OverviewTab =" with "const SalesReportTab =" in scratch_content
scratch_content = scratch_content.replace("const OverviewTab = ({ refreshTrigger }: { refreshTrigger: number }) => {", "const SalesReportTab = ({ refreshTrigger }: { refreshTrigger?: number }) => {")

# Insert before WebOrdersTab
insert_idx = content.find("  const WebOrdersTab =")
new_content = content[:insert_idx] + scratch_content + "\n" + content[insert_idx:]

with open('src/app/components/OperationsDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
