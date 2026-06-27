import os
import re

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Initialize orders with sessionStorage cache
old_orders_state = """const [orders, setOrders] = useState<any[]>([]);"""
new_orders_state = """const [orders, setOrders] = useState<any[]>(() => {
    const cached = sessionStorage.getItem('adminOrders');
    return cached ? JSON.parse(cached) : [];
  });"""
content = content.replace(old_orders_state, new_orders_state)

# 2. Modify fetchOrders to save to sessionStorage
old_fetch_orders_cache = """prevOrderCountRef.current = newCount;
      w.__apiCache.adminOrders = res.data;
      
      setOrders(res.data);"""
new_fetch_orders_cache = """prevOrderCountRef.current = newCount;
      w.__apiCache.adminOrders = res.data;
      sessionStorage.setItem('adminOrders', JSON.stringify(res.data));
      setOrders(res.data);"""
content = content.replace(old_fetch_orders_cache, new_fetch_orders_cache)

# 3. Modify fetchCurrentTabData to fetch dependencies for OverviewTab
old_overview_fetch = """        if (activeTab === 'overview') {
            promises.push(fetchOverview());
        } else if (activeTab === 'authors' || activeTab === 'author_data') {"""
new_overview_fetch = """        if (activeTab === 'overview') {
            promises.push(fetchOverview());
            promises.push(fetchOrders(true));
            promises.push(fetchAuthors(true));
            promises.push(fetchBooks(true));
        } else if (activeTab === 'authors' || activeTab === 'author_data') {"""
content = content.replace(old_overview_fetch, new_overview_fetch)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Overview bug fixed.")
