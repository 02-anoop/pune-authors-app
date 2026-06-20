import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add state
if "const [hasNewQueries, setHasNewQueries] = useState(false);" not in content:
    content = content.replace(
        "const [hasNewOrders, setHasNewOrders] = useState(false);",
        "const [hasNewOrders, setHasNewOrders] = useState(false);\n  const [hasNewQueries, setHasNewQueries] = useState(false);\n  const prevQueryAnsCountRef = useRef<number>(0);"
    )

# 2. Clear on tab switch
if "setHasNewQueries(false);" not in content:
    content = content.replace(
        "    if (location.pathname.includes('/orders')) {\n      setHasNewOrders(false);\n    }",
        "    if (location.pathname.includes('/orders')) {\n      setHasNewOrders(false);\n    }\n    if (location.pathname.includes('/queries')) {\n      setHasNewQueries(false);\n    }"
    )

# 3. Add fetchQueriesAlert
fetch_alert_code = """
  const fetchQueriesAlert = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/queries`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      const answeredCount = res.data.filter((q: any) => q.status === 'Answered').length;
      if (prevQueryAnsCountRef.current > 0 && answeredCount > prevQueryAnsCountRef.current && !location.pathname.includes('/queries')) {
         setHasNewQueries(true);
      }
      prevQueryAnsCountRef.current = answeredCount;
    } catch(err) {}
  };
"""

if "fetchQueriesAlert" not in content:
    content = content.replace("  const fetchDashboardData = async", fetch_alert_code + "\n  const fetchDashboardData = async")

# 4. Add fetchQueriesAlert to fetchDashboardData
if "await fetchQueriesAlert();" not in content:
    content = content.replace(
        "        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/dashboard`, {",
        "        await fetchQueriesAlert();\n        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/dashboard`, {"
    )

# 5. Add blinking dot to the link
old_link = """          <Link to="/dashboard/queries" className={`${location.pathname.includes('/queries') ? 'text-paa-navy border-b-2 border-paa-navy' : 'text-gray-500 hover:text-paa-navy'} pb-1 transition-colors whitespace-nowrap`}>Support & Queries</Link>"""
new_link = """          <Link to="/dashboard/queries" className={`${location.pathname.includes('/queries') ? 'text-paa-navy border-b-2 border-paa-navy' : 'text-gray-500 hover:text-paa-navy'} pb-1 transition-colors whitespace-nowrap relative`}>
            Support & Queries
            {hasNewQueries && <span className="absolute -top-1 -right-3 w-2.5 h-2.5 bg-paa-gold rounded-full animate-ping"></span>}
            {hasNewQueries && <span className="absolute -top-1 -right-3 w-2.5 h-2.5 bg-paa-gold rounded-full"></span>}
          </Link>"""

if "{hasNewQueries &&" not in content:
    content = content.replace(old_link, new_link)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
