import os

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1. Insert hooks at line 156
hooks_to_insert = """
  // Events tab lifted state
  const [selectedEventBreakdown, setSelectedEventBreakdown] = useState<any>(null);
  const [selectedAuthorForData, setSelectedAuthorForData] = useState<any>(null);
  const [hasGranularData, setHasGranularData] = useState(false);
  const [authorSearch, setAuthorSearch] = useState('');
  const [createEventDate, setCreateEventDate] = useState('');
  const [manageAuthorBooks, setManageAuthorBooks] = useState<any[]>([]);
  const [manageRegStatus, setManageRegStatus] = useState('Participated');
  const [managePaymentStatus, setManagePaymentStatus] = useState('Paid');
  const [isPublishingData, setIsPublishingData] = useState(false);
"""

# Find line 156 area
insert_idx = -1
for i, line in enumerate(lines):
    if 'const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);' in line:
        insert_idx = i
        break

if insert_idx != -1:
    lines.insert(insert_idx, hooks_to_insert)

# 2. Rename `const EventsTab = () => {` to `const renderEventsTab = () => {`
# and delete the 9 hooks from inside it
events_tab_idx = -1
for i, line in enumerate(lines):
    if 'const EventsTab = () => {' in line:
        events_tab_idx = i
        lines[i] = line.replace('const EventsTab = () => {', 'const renderEventsTab = () => {')
        break

if events_tab_idx != -1:
    # Delete the next 9 lines containing the hooks
    # Let's just find and delete them carefully
    lines_to_delete = []
    for j in range(events_tab_idx + 1, events_tab_idx + 20):
        if 'const [selectedEventBreakdown' in lines[j]: lines_to_delete.append(j)
        if 'const [selectedAuthorForData' in lines[j]: lines_to_delete.append(j)
        if 'const [hasGranularData' in lines[j]: lines_to_delete.append(j)
        if 'const [authorSearch' in lines[j]: lines_to_delete.append(j)
        if 'const [createEventDate' in lines[j]: lines_to_delete.append(j)
        if 'const [manageAuthorBooks' in lines[j]: lines_to_delete.append(j)
        if 'const [manageRegStatus' in lines[j]: lines_to_delete.append(j)
        if 'const [managePaymentStatus' in lines[j]: lines_to_delete.append(j)
        if 'const [isPublishingData' in lines[j]: lines_to_delete.append(j)
        if '// Form state for managing author data' in lines[j]: lines_to_delete.append(j)
    
    # Delete from highest index first
    lines_to_delete.sort(reverse=True)
    for idx in lines_to_delete:
        del lines[idx]

# 3. Change `{activeTab === 'events' && <EventsTab />}`
for i, line in enumerate(lines):
    if "{activeTab === 'events' && <EventsTab />}" in line:
        lines[i] = line.replace("<EventsTab />", "renderEventsTab()")
        break

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Fixed EventsTab render lifecycle")
