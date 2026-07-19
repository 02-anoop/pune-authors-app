import os
import re

src_dir = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components"
dashboard_path = os.path.join(src_dir, "OperationsDashboardPage.tsx")

with open(dashboard_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the Promise.all array with a switch statement based on activeTab
old_fetch_block = """        await Promise.all([
          fetchOverview(),
          fetchAuthors(),
          fetchBooks(),
          fetchEvents(),
          fetchOrders(true),
          fetchForms(),
          fetchGallery(),
          fetchQueriesAlert(true)
        ]);"""

new_fetch_block = """        // Optimized data fetching: Only fetch what is necessary for the active tab
        const promises = [];
        if (activeTab === 'overview') {
            promises.push(fetchOverview());
        } else if (activeTab === 'authors' || activeTab === 'author_data') {
            promises.push(fetchAuthors());
        } else if (activeTab === 'books') {
            promises.push(fetchBooks());
        } else if (activeTab === 'events') {
            promises.push(fetchEvents());
        } else if (activeTab === 'orders' || activeTab === 'web_orders') {
            promises.push(fetchOrders(true));
        } else if (activeTab === 'forms') {
            promises.push(fetchForms());
        } else if (activeTab === 'gallery') {
            promises.push(fetchGallery());
        } else if (activeTab === 'helpdesk') {
            promises.push(fetchQueriesAlert(true));
        }
        // Always fetch lightweight alerts
        promises.push(fetchQueriesAlert(true));
        
        await Promise.all(promises);"""

new_content = content.replace(old_fetch_block, new_fetch_block)

with open(dashboard_path, "w", encoding="utf-8") as f:
    f.write(new_content)
print("Polling mechanism optimized.")
