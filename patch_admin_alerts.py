import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update states
if "const [pendingAlerts, setPendingAlerts] = useState" not in content:
    content = content.replace(
        "const [hasNewOrders, setHasNewOrders] = useState(false);\n  const [hasNewQueries, setHasNewQueries] = useState(false);",
        "const [pendingAlerts, setPendingAlerts] = useState({ orders: false, queries: false, authors: false, books: false });"
    )

# 2. Update fetch logic to set true if ANY pending items exist
# We will intercept the fetch logic.
# fetchAuthors
content = re.sub(
    r"setAuthors\(res\.data\);",
    "setAuthors(res.data);\n      setPendingAlerts(prev => ({ ...prev, authors: res.data.some((a: any) => a.status === 'Pending') }));",
    content
)

# fetchBooks
content = re.sub(
    r"setBooks\(res\.data\);",
    "setBooks(res.data);\n      setPendingAlerts(prev => ({ ...prev, books: res.data.some((b: any) => b.status === 'Pending') }));",
    content
)

# fetchOrders
content = re.sub(
    r"setOrders\(res\.data\);",
    "setOrders(res.data);\n      setPendingAlerts(prev => ({ ...prev, orders: res.data.some((o: any) => o.status === 'Pending') }));",
    content
)

# fetchQueriesAlert
new_fetch_queries = """
  const fetchQueriesAlert = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/queries`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      setPendingAlerts(prev => ({ ...prev, queries: res.data.some((q: any) => q.status === 'Pending') }));
    } catch(err) {}
  };
"""

content = re.sub(
    r"const fetchQueriesAlert = async.*?};",
    new_fetch_queries.strip(),
    content,
    flags=re.DOTALL
)

# 3. Update the sidebar rendering to use pendingAlerts
content = re.sub(
    r"\{ id: 'authors', label: 'Authors Menu', icon: Users \},",
    "{ id: 'authors', label: 'Authors Menu', icon: Users, hasAlert: pendingAlerts.authors },",
    content
)
content = re.sub(
    r"\{ id: 'books', label: 'Inventory / Books', icon: BookOpen \},",
    "{ id: 'books', label: 'Inventory / Books', icon: BookOpen, hasAlert: pendingAlerts.books },",
    content
)
content = re.sub(
    r"\{ id: 'orders', label: 'Web Orders', icon: ShoppingCart, hasAlert: hasNewOrders \},",
    "{ id: 'orders', label: 'Web Orders', icon: ShoppingCart, hasAlert: pendingAlerts.orders },",
    content
)
content = re.sub(
    r"\{ id: 'orders', label: 'Web Orders', icon: ShoppingCart \},",
    "{ id: 'orders', label: 'Web Orders', icon: ShoppingCart, hasAlert: pendingAlerts.orders },",
    content
)
content = re.sub(
    r"\{ id: 'helpdesk', label: 'Helpdesk / Queries', icon: Users, hasAlert: hasNewQueries \},",
    "{ id: 'helpdesk', label: 'Helpdesk / Queries', icon: Users, hasAlert: pendingAlerts.queries },",
    content
)
content = re.sub(
    r"\{ id: 'helpdesk', label: 'Helpdesk / Queries', icon: Users \},",
    "{ id: 'helpdesk', label: 'Helpdesk / Queries', icon: Users, hasAlert: pendingAlerts.queries },",
    content
)

# Remove the old clearing logic
content = re.sub(
    r"if \(activeTab === 'orders'\) \{\s*setHasNewOrders\(false\);\s*\}\s*if \(activeTab === 'helpdesk'\) \{\s*setHasNewQueries\(false\);\s*\}",
    "",
    content
)
content = re.sub(
    r"if \(activeTab === 'orders'\) \{\s*setHasNewOrders\(false\);\s*\}",
    "",
    content
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
