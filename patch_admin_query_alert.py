import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add hasNewQueries state
if "const [hasNewQueries, setHasNewQueries] = useState(false);" not in content:
    content = content.replace(
        "const [hasNewOrders, setHasNewOrders] = useState(false);",
        "const [hasNewOrders, setHasNewOrders] = useState(false);\n  const [hasNewQueries, setHasNewQueries] = useState(false);\n  const prevQueryCountRef = useRef<number>(0);"
    )

# 2. Clear hasNewQueries on tab switch
if "setHasNewQueries(false);" not in content:
    content = content.replace(
        "    if (activeTab === 'orders') {\n      setHasNewOrders(false);\n    }",
        "    if (activeTab === 'orders') {\n      setHasNewOrders(false);\n    }\n    if (activeTab === 'helpdesk') {\n      setHasNewQueries(false);\n    }"
    )

# 3. Add fetchQueriesAlert
fetch_alert_code = """
  const fetchQueriesAlert = async (background = false) => {
    try {
      const res = await axios.get(`${API}/api/admin/queries`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      const pendingCount = res.data.filter((q: any) => q.status === 'Pending').length;
      if (background && prevQueryCountRef.current > 0 && pendingCount > prevQueryCountRef.current && activeTab !== 'helpdesk') {
         setHasNewQueries(true);
      }
      prevQueryCountRef.current = pendingCount;
    } catch(err) {}
  };
"""

if "fetchQueriesAlert" not in content:
    content = content.replace("  const fetchForms", fetch_alert_code + "\n  const fetchForms")

# 4. Add fetchQueriesAlert to fetchCurrentTabData
if "fetchQueriesAlert(" not in content:
    content = content.replace(
        "fetchForms(),\n          fetchGallery()",
        "fetchForms(),\n          fetchGallery(),\n          fetchQueriesAlert(true)"
    )

# 5. Add hasAlert to the sidebar mapping
if "{ id: 'helpdesk', label: 'Helpdesk / Queries', icon: Users, hasAlert: hasNewQueries }," not in content:
    content = content.replace(
        "{ id: 'helpdesk', label: 'Helpdesk / Queries', icon: Users },",
        "{ id: 'helpdesk', label: 'Helpdesk / Queries', icon: Users, hasAlert: hasNewQueries },"
    )

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
