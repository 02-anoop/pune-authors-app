import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. We need a state for lastRefreshTime
if "const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());" not in content:
    content = content.replace(
        "const [isRefreshing, setIsRefreshing] = useState(false);",
        "const [isRefreshing, setIsRefreshing] = useState(false);\n  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());"
    )

# 2. Update the interval to also set lastRefreshTime
old_interval = """    const fetchCurrentTabData = async () => {
      setIsRefreshing(true);
      try {
        await fetchDashboardData();
      } finally {
        setTimeout(() => setIsRefreshing(false), 800);
      }
    };"""

new_interval = """    const fetchCurrentTabData = async () => {
      setIsRefreshing(true);
      try {
        await fetchDashboardData();
        setLastRefreshTime(Date.now());
      } finally {
        setTimeout(() => setIsRefreshing(false), 800);
      }
    };"""
content = content.replace(old_interval, new_interval)

# 3. Pass lastRefreshTime to the tabs
content = content.replace("<AuthorQueriesTab />", "<AuthorQueriesTab refreshTrigger={lastRefreshTime} />")
content = content.replace("<EventsDashboard registrations={dashboardData.authorProfile.eventRegistrations} />", "<EventsDashboard registrations={dashboardData.authorProfile.eventRegistrations} refreshTrigger={lastRefreshTime} />")
# AuthorCatalogueTab doesn't fetch, it uses JSON
# FormsDashboard doesn't fetch, it maps formResponses
# InventoryDashboard doesn't fetch, it maps books

# 4. Update the signatures of the components
content = content.replace("function EventsDashboard() {", "function EventsDashboard({ registrations, refreshTrigger }: any) {")
# EventsDashboard has a useEffect that needs refreshTrigger
content = content.replace(
    """  useEffect(() => {
    fetchAuthorEvents();
  }, []);""",
    """  useEffect(() => {
    fetchAuthorEvents();
  }, [refreshTrigger]);"""
)

content = content.replace("function AuthorQueriesTab() {", "function AuthorQueriesTab({ refreshTrigger }: any) {")
# AuthorQueriesTab has a useEffect that needs refreshTrigger
content = content.replace(
    """  useEffect(() => {
    fetchQueries();
  }, []);""",
    """  useEffect(() => {
    fetchQueries();
  }, [refreshTrigger]);"""
)

# 5. Move the blinking bar to be "under the tab name"
# Remove it from the top
old_refresh_bar = """      {/* Refresh Animation Bar */}
      {isRefreshing && (
        <div className="fixed top-0 left-0 right-0 h-1.5 bg-paa-gold z-50 overflow-hidden">
          <div className="h-full bg-paa-navy/30 animate-[pulse_0.5s_ease-in-out_infinite] w-full" />
        </div>
      )}"""
content = content.replace(old_refresh_bar, "")

# Add it under the tabs
tabs_end = """        </div>
      </div>

      {/* Main Content Area */}"""

new_tabs_end = """        </div>
        {/* Blinking under tab name */}
        <div className="h-0.5 w-full bg-gray-200 overflow-hidden">
           {isRefreshing && <div className="h-full bg-paa-navy animate-[pulse_0.5s_ease-in-out_infinite] w-full" />}
        </div>
      </div>

      {/* Main Content Area */}"""
content = content.replace(tabs_end, new_tabs_end)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
