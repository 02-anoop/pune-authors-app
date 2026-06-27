import os

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix 1: Cache essential states in sessionStorage to prevent loading skeletons
old_state_authors = """  const [authors, setAuthors] = useState<any[]>([]);"""
new_state_authors = """  const [authors, setAuthors] = useState<any[]>(() => {
    const cached = sessionStorage.getItem('adminAuthors');
    return cached ? JSON.parse(cached) : [];
  });"""
content = content.replace(old_state_authors, new_state_authors)

old_state_books = """  const [books, setBooks] = useState<any[]>([]);"""
new_state_books = """  const [books, setBooks] = useState<any[]>(() => {
    const cached = sessionStorage.getItem('adminBooks');
    return cached ? JSON.parse(cached) : [];
  });"""
content = content.replace(old_state_books, new_state_books)

old_state_events = """  const [events, setEvents] = useState<any[]>([]);"""
new_state_events = """  const [events, setEvents] = useState<any[]>(() => {
    const cached = sessionStorage.getItem('adminEvents');
    return cached ? JSON.parse(cached) : [];
  });"""
content = content.replace(old_state_events, new_state_events)

old_state_stats = """  const [stats, setStats] = useState<any>({ totalAuthors: 0, totalBooks: 0, eventParticipations: 0, totalRevenue: 0, revenueData: [], recentActivities: [], salesByAuthor: [], salesByGenre: [], topSellingBooks: [], topCustomers: [], lowStockAlerts: [] });"""
new_state_stats = """  const [stats, setStats] = useState<any>(() => {
    const cached = sessionStorage.getItem('adminStats');
    return cached ? JSON.parse(cached) : { totalAuthors: 0, totalBooks: 0, eventParticipations: 0, totalRevenue: 0, revenueData: [], recentActivities: [], salesByAuthor: [], salesByGenre: [], topSellingBooks: [], topCustomers: [], lowStockAlerts: [] };
  });"""
content = content.replace(old_state_stats, new_state_stats)

old_state_loading = """  const [loading, setLoading] = useState(true);"""
new_state_loading = """  const [loading, setLoading] = useState(!sessionStorage.getItem('adminAuthors'));"""
content = content.replace(old_state_loading, new_state_loading)

# Save to sessionStorage in fetch functions
content = content.replace(
    'setAuthors(res.data);',
    "setAuthors(res.data); sessionStorage.setItem('adminAuthors', JSON.stringify(res.data));"
)
content = content.replace(
    'setBooks(res.data);',
    "setBooks(res.data); sessionStorage.setItem('adminBooks', JSON.stringify(res.data));"
)
content = content.replace(
    'setEvents(res.data);',
    "setEvents(res.data); sessionStorage.setItem('adminEvents', JSON.stringify(res.data));"
)
content = content.replace(
    'setStats(res.data);',
    "setStats(res.data); sessionStorage.setItem('adminStats', JSON.stringify(res.data));"
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("OperationsDashboardPage cached.")
