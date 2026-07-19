import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# In OperationsDashboardPage.tsx, we have a fetchDashboardData function. Let's make sure it runs on interval.
# But wait, each Tab fetches its own data or everything is in fetchDashboardData?
# Actually, the Operations Dashboard has fetchDashboardData which fetches Authors, Books, Stats, Orders, Forms.
# Wait, some tabs like Events, Gallery, AuthorData have their own fetches.
# We should trigger fetchDashboardData and trigger other fetches if the tab is active.

interval_code = """
  // Auto-refresh mechanism
  useEffect(() => {
    const fetchCurrentTabData = async () => {
      setIsRefreshing(true);
      try {
        await fetchDashboardData(); // Fetches stats, authors, books, orders, forms
        
        // Tab-specific refreshes if they exist on window or in scope...
        // The easiest way is to just let the main data refresh, and for individual tabs, they usually refresh on mount.
        // We will force a re-fetch of everything globally by re-running fetchDashboardData.
      } finally {
        setTimeout(() => setIsRefreshing(false), 800); // Small delay to show the animation
      }
    };

    // Refresh immediately when activeTab changes
    fetchCurrentTabData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchCurrentTabData, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);
"""

# Let's see if there is an existing useEffect for fetchDashboardData
old_use_effect = """  useEffect(() => {
    fetchDashboardData();
  }, []);"""

if "const interval = setInterval(" not in content:
    if old_use_effect in content:
        content = content.replace(old_use_effect, interval_code)
    else:
        # Fallback if it's not exactly matching
        content = content.replace(
            "useEffect(() => {", 
            interval_code + "\n  // Old useEffect removed/bypassed\n  /* useEffect(() => {",
            1
        )
        content = content.replace("}, []);", "}, []); */\n", 1)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
