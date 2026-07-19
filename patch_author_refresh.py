import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add isRefreshing state if it doesn't exist
if "const [isRefreshing, setIsRefreshing] = useState(false);" not in content:
    content = content.replace(
        "const [loading, setLoading] = useState(true);",
        "const [loading, setLoading] = useState(true);\n  const [isRefreshing, setIsRefreshing] = useState(false);\n  const location = useLocation();"
    )

# Add auto-refresh interval
interval_code = """
  // Auto-refresh mechanism
  useEffect(() => {
    const fetchCurrentTabData = async () => {
      setIsRefreshing(true);
      try {
        await fetchDashboardData();
      } finally {
        setTimeout(() => setIsRefreshing(false), 800);
      }
    };

    // Refresh immediately when route/tab changes
    fetchCurrentTabData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchCurrentTabData, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);
"""

old_use_effect = """  useEffect(() => {
    fetchDashboardData();
  }, []);"""

if "const interval = setInterval(" not in content:
    if old_use_effect in content:
        content = content.replace(old_use_effect, interval_code)
    else:
        content = content.replace(
            "useEffect(() => {", 
            interval_code + "\n  // Old useEffect removed/bypassed\n  /* useEffect(() => {",
            1
        )
        content = content.replace("}, []);", "}, []); */\n", 1)

# Add Refresh Animation Bar
refresh_bar_code = """
      {/* Refresh Animation Bar */}
      {isRefreshing && (
        <div className="fixed top-0 left-0 right-0 h-1.5 bg-paa-gold z-50 overflow-hidden">
          <div className="h-full bg-paa-navy/30 animate-[pulse_0.5s_ease-in-out_infinite] w-full" />
        </div>
      )}
"""

if "Refresh Animation Bar" not in content:
    content = content.replace(
        "<div className=\"min-h-screen bg-gray-50 font-sans\">",
        "<div className=\"min-h-screen bg-gray-50 font-sans\">\n" + refresh_bar_code
    )

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
