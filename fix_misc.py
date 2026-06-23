import re

with open('src/app/components/OperationsDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix Rupee Symbol
content = content.replace('â‚¹', '₹')

# 2. Fix pending alerts clearing when tab is visited
alert_clear_code = """
  useEffect(() => {
     if (activeTab === 'authors') setPendingAlerts(p => ({ ...p, authors: false }));
     if (activeTab === 'books') setPendingAlerts(p => ({ ...p, books: false }));
     if (activeTab === 'web_orders' || activeTab === 'orders') setPendingAlerts(p => ({ ...p, orders: false }));
     if (activeTab === 'events') setPendingAlerts(p => ({ ...p, events: false }));
     if (activeTab === 'helpdesk') setPendingAlerts(p => ({ ...p, helpdesk: false }));
     localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);
"""
# Replace the existing localStorage save
content = content.replace(
    "  useEffect(() => {\n    localStorage.setItem('adminActiveTab', activeTab);\n  }, [activeTab]);",
    alert_clear_code
)

# 3. Filter out "Others" from category chart
old_cat_code = """    const categoryChartData = Object.entries(categorySalesMap)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 8);"""
new_cat_code = """    const categoryChartData = Object.entries(categorySalesMap)
      .filter(([name]) => name !== 'Others' && name !== 'Uncategorized' && name !== 'N/A')
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);"""
content = content.replace(old_cat_code, new_cat_code)

with open('src/app/components/OperationsDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Applied fixes")
