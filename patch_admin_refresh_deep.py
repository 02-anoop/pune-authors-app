import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add lastRefreshTime state
if "const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());" not in content:
    content = content.replace(
        "const [isRefreshing, setIsRefreshing] = useState(false);",
        "const [isRefreshing, setIsRefreshing] = useState(false);\n  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());"
    )

# 2. Update the interval to also set lastRefreshTime
old_interval = """    const fetchCurrentTabData = async () => {
      setIsRefreshing(true);
      try {
        await fetchDashboardData(); // Fetches stats, authors, books, orders, forms
        
        // Tab-specific refreshes if they exist on window or in scope...
        // The easiest way is to just let the main data refresh, and for individual tabs, they usually refresh on mount.
        // We will force a re-fetch of everything globally by re-running fetchDashboardData.
      } finally {
        setTimeout(() => setIsRefreshing(false), 800); // Small delay to show the animation
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

# 3. Add refreshTrigger to all the tabs inside OperationsDashboardPage
content = content.replace("<AuthorsTab />", "<AuthorsTab refreshTrigger={lastRefreshTime} />")
content = content.replace("<BooksTab />", "<BooksTab refreshTrigger={lastRefreshTime} />")
content = content.replace("<EventsTab />", "<EventsTab refreshTrigger={lastRefreshTime} />")
content = content.replace("<OrdersTab />", "<OrdersTab refreshTrigger={lastRefreshTime} />")
content = content.replace("<GalleryTab />", "<GalleryTab refreshTrigger={lastRefreshTime} />")
content = content.replace("<AuthorDataTab />", "<AuthorDataTab refreshTrigger={lastRefreshTime} />")
content = content.replace("<HelpdeskTab />", "<HelpdeskTab refreshTrigger={lastRefreshTime} />")

# 4. Update tab components to accept and use refreshTrigger
# Let's use regex to find and replace the useEffect array for these tabs

tabs_with_fetch = ["AuthorsTab", "BooksTab", "EventsTab", "GalleryTab", "AuthorDataTab", "HelpdeskTab"]

for tab in tabs_with_fetch:
    content = re.sub(rf"const {tab} = \(\) => {{", rf"const {tab} = ({{ refreshTrigger }}: any) => {{", content)
    
# Many of them have:
# useEffect(() => { fetch...(); }, []);
# We need to change `}, []);` to `}, [refreshTrigger]);` but only inside those specific components.
# Actually, the simplest approach for a global replace is to just replace all `}, []);` that follow a fetch call inside these components.
# But regex could be tricky.

# Let's replace the top refresh bar with the "blinking under tab name" indicator.
# For OperationsDashboardPage, the "tab name" is rendered in the top header.
old_refresh_bar = """      {/* Refresh Animation Bar */}
      {isRefreshing && (
        <div className="fixed top-0 left-0 right-0 h-1.5 bg-paa-gold z-50 overflow-hidden">
          <div className="h-full bg-paa-navy/30 animate-[pulse_0.5s_ease-in-out_infinite] w-full" />
        </div>
      )}"""

content = content.replace(old_refresh_bar, "")

header_end = """           <div className="flex items-center gap-4">
              <button className="relative p-2 text-paa-navy border border-paa-navy/10 bg-white hover:bg-paa-navy hover:text-paa-cream transition-colors">
                 <Bell className="w-4 h-4" />
                 <span className="absolute top-1 right-1 w-2 h-2 bg-[#d9534f] rounded-full border border-white"></span>
              </button>
              <button className="md:hidden p-2 text-paa-navy border border-paa-navy/10 bg-white hover:bg-paa-navy hover:text-paa-cream transition-colors">
                 <Menu className="w-4 h-4" />
              </button>
           </div>
        </header>"""

new_header_end = """           <div className="flex items-center gap-4">
              <button className="relative p-2 text-paa-navy border border-paa-navy/10 bg-white hover:bg-paa-navy hover:text-paa-cream transition-colors">
                 <Bell className="w-4 h-4" />
                 <span className="absolute top-1 right-1 w-2 h-2 bg-[#d9534f] rounded-full border border-white"></span>
              </button>
              <button className="md:hidden p-2 text-paa-navy border border-paa-navy/10 bg-white hover:bg-paa-navy hover:text-paa-cream transition-colors">
                 <Menu className="w-4 h-4" />
              </button>
           </div>
        </header>
        {/* Blinking under tab name */}
        <div className="h-0.5 w-full bg-gray-200 overflow-hidden shrink-0">
           {isRefreshing && <div className="h-full bg-paa-navy animate-[pulse_0.5s_ease-in-out_infinite] w-full" />}
        </div>"""

content = content.replace(header_end, new_header_end)


# Now to fix the useEffects inside the specific tabs without breaking everything.
# Let's search for specific fetch calls inside useEffect and add the dependency.

fetches = [
    ("fetchEvents();", "fetchEvents"),
    ("fetchGallery();", "fetchGallery"),
    ("fetchQueries();", "fetchQueries")
]

for call, func in fetches:
    pattern = r"useEffect\(\(\) => \{\s*" + call + r"\s*\}, \[\]\);"
    replacement = "useEffect(() => { " + call + " }, [refreshTrigger]);"
    content = re.sub(pattern, replacement, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
