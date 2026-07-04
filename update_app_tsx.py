import os

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\App.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

import_added = False
route_added = False

for i, line in enumerate(lines):
    if not import_added and 'import { BookDetailPage }' in line:
        lines.insert(i + 1, 'import { LivePosDashboard } from "./components/LivePosDashboard";\n')
        import_added = True
    if not route_added and '<Route path="/operations/*" element={<OperationsDashboardPage />} />' in line:
        lines.insert(i + 1, '          <Route path="/pos/:eventId" element={<LivePosDashboard />} />\n')
        route_added = True

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Added POS route to App.tsx")
