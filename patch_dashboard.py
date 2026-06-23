import re

with open('src/app/components/OperationsDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update activeTab type
content = re.sub(
    r"useState<'overview' \| 'orders' \| 'web_orders' \| 'authors' \| 'books' \| 'events' \| 'forms' \| 'gallery' \| 'author_data' \| 'helpdesk' \| 'settings'>",
    "useState<'overview' | 'orders' | 'web_orders' | 'sales_report' | 'authors' | 'books' | 'events' | 'forms' | 'gallery' | 'author_data' | 'helpdesk' | 'settings'>",
    content
)

# 2. Update navItems
navItemsMatch = re.search(r"const navItems = \[\s*\{ id: 'overview', label: 'Overview', icon: <LayoutDashboard size=\{20\} /> \},\s*\{ id: 'web_orders', label: 'Web Orders', icon: <ShoppingCart size=\{20\} />, active: activeTab === 'web_orders' \|\| activeTab === 'orders' \},", content)
if navItemsMatch:
    newNavItems = navItemsMatch.group(0) + "\n    { id: 'sales_report', label: 'Sales Reports', icon: <TrendingUp size={20} /> },"
    content = content.replace(navItemsMatch.group(0), newNavItems)

# 3. Add SalesReportTab inside the render block
sales_report_render = "{activeTab === 'sales_report' && <SalesReportTab refreshTrigger={lastRefreshTime} />}"
# Insert it after web_orders render
content = re.sub(
    r"(\{activeTab === 'web_orders' && <WebOrdersTab refreshTrigger=\{lastRefreshTime\} />\})",
    r"\1\n           " + sales_report_render,
    content
)

with open('src/app/components/OperationsDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Initial patches done.")
