with open('src/app/components/OperationsDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. AuthorFullProfileView Skeleton
old_loading_profile = '''  if (loading) return <div className="p-8 text-center text-paa-navy font-bold bg-white border border-paa-navy/10 shadow-sm animate-pulse">Loading author details...</div>;'''
new_loading_profile = '''  if (loading) return (
    <div className="p-8 bg-white border border-paa-navy/10 shadow-sm space-y-6">
       <div className="flex gap-4 items-center">
          <div className="w-14 h-14 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
       </div>
       <div className="h-64 bg-gray-200 animate-pulse rounded w-full"></div>
    </div>
  );'''
content = content.replace(old_loading_profile, new_loading_profile)

# 2. Add loading state to OperationsDashboardPage
old_state = '''  const [activeTab, setActiveTab] = useState<'overview' | 'authors' | 'books' | 'events' | 'orders' | 'settings' | 'forms' | 'gallery'>('overview');'''
new_state = '''  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'authors' | 'books' | 'events' | 'orders' | 'settings' | 'forms' | 'gallery'>('overview');'''
content = content.replace(old_state, new_state)

# 3. Update useEffect in OperationsDashboardPage
old_use_effect = '''  useEffect(() => {
    fetchOverview();
    fetchAuthors();
    fetchBooks();
    fetchEvents();
    fetchOrders();
    fetchForms();
    fetchGallery();
  }, []);'''
new_use_effect = '''  useEffect(() => {
    Promise.all([
      fetchOverview(),
      fetchAuthors(),
      fetchBooks(),
      fetchEvents(),
      fetchOrders(),
      fetchForms(),
      fetchGallery()
    ]).finally(() => setLoading(false));
  }, []);'''
content = content.replace(old_use_effect, new_use_effect)

# 4. Add loading skeleton to OperationsDashboardPage return
old_return = '''  return (
    <div className="min-h-screen bg-paa-cream flex flex-col md:flex-row font-sans text-paa-navy selection:bg-paa-gold selection:text-white">'''
new_return = '''  if (loading) {
    return (
      <div className="min-h-screen bg-paa-cream flex flex-col md:flex-row p-6 font-sans">
        <div className="w-64 shrink-0 h-screen hidden md:block space-y-4">
          <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="flex-1 space-y-6 md:pl-6">
          <div className="h-16 bg-gray-200 animate-pulse rounded w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="h-32 bg-gray-200 animate-pulse rounded w-full"></div>
            <div className="h-32 bg-gray-200 animate-pulse rounded w-full"></div>
            <div className="h-32 bg-gray-200 animate-pulse rounded w-full"></div>
            <div className="h-32 bg-gray-200 animate-pulse rounded w-full"></div>
          </div>
          <div className="h-96 bg-gray-200 animate-pulse rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paa-cream flex flex-col md:flex-row font-sans text-paa-navy selection:bg-paa-gold selection:text-white">'''
content = content.replace(old_return, new_return)

with open('src/app/components/OperationsDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated OperationsDashboardPage.tsx skeletons")
