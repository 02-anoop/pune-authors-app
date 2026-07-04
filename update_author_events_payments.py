import os

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1. Update allEvents definition to include Activity registrations
allEvents_start = -1
for i, line in enumerate(lines):
    if "const allEvents = [" in line:
        allEvents_start = i
        break

if allEvents_start != -1:
    lines.insert(allEvents_start + 1, """     ...(registrations || []).map((r: any) => ({
         id: 'act_' + r.activityId,
         name: r.activity?.name || 'Unknown Event',
         startDate: r.activity?.date,
         location: r.activity?.city,
         type: r.activity?.type || 'Activity',
         registration: r.status,
         paymentStatus: r.amount > 0 ? 'Paid' : 'Unpaid',
         amountPaid: r.amount || 0,
         isActivity: true
     })),
""")

# 2. Add Payment column to the Events Overview table header
header_idx = -1
for i, line in enumerate(lines):
    if "<th className=\"p-4 font-semibold text-right\">Revenue</th>" in line:
        header_idx = i
        break
if header_idx != -1:
    lines.insert(header_idx + 1, "                <th className=\"p-4 font-semibold text-right\">Payment Done</th>\n")

# 3. Add Payment column to the Events Overview table body
body_idx = -1
for i, line in enumerate(lines):
    if "<td className=\"p-4 text-sm font-mono text-right\">{evt.isPast && !evt.isDataUpdated ? '-' : `₹${rev}`}</td>" in line:
        body_idx = i
        break
if body_idx != -1:
    lines.insert(body_idx + 1, "                   <td className=\"p-4 text-sm font-mono text-right\">{evt.amountPaid ? `₹${evt.amountPaid}` : '-'}</td>\n")

# 4. In "Event Details" tab (activeTab === 'details'), show Payment info.
# Find where the status is shown in the details tab.
details_status_idx = -1
for i, line in enumerate(lines):
    if "<div className=\"text-sm font-medium\">{evt.status || (evt.isPast ? 'Completed' : 'Active')}</div>" in line:
        details_status_idx = i + 1
        break

if details_status_idx != -1:
    details_payment = """                        </div>
                        <div>
                           <div className="text-xs text-gray-500 uppercase font-semibold">Payment Done</div>
                           <div className="text-sm font-medium">{evt.amountPaid ? `₹${evt.amountPaid}` : '-'}</div>
"""
    lines.insert(details_status_idx, details_payment)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Updated Author Dashboard to include Activity registrations and payments!")
