import os

file_ops = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx"
with open(file_ops, 'r', encoding='utf-8') as f:
    ops_lines = f.readlines()

# OperationsDashboardPage: Add POS column
# Find "<th ...>Status</th>"
for i, line in enumerate(ops_lines):
    if ">Status</th>" in line:
        ops_lines.insert(i + 1, '                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-paa-navy/5 text-center">POS</th>\n')
        break

# Find the td for Status which is the one above Authors
# The TD structure is:
# <td className="px-4 py-3">
#   <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${evt.isLegacy ? 'bg-gray-200 text-gray-700' : (evt.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700')}`}>
#      {evt.isLegacy ? 'Legacy Archive' : evt.status}
#   </span>
# </td>
# We can find `evt.isLegacy ? 'Legacy Archive' : evt.status`
for i, line in enumerate(ops_lines):
    if "{evt.isLegacy ? 'Legacy Archive' : evt.status}" in line:
        # The closing </td> is at i+2
        ops_lines.insert(i + 3, '                        <td className="px-4 py-3 text-sm font-bold text-center">{evt.livePosEnabled && !evt.isPast ? <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Enabled</span> : <span className="text-gray-400">-</span>}</td>\n')
        break

# Remove Launch POS button
start_btn = -1
end_btn = -1
for i, line in enumerate(ops_lines):
    if "{evt.livePosEnabled && !evt.isPast && (" in line and "Launch POS" in ops_lines[i+3]:
        start_btn = i
        end_btn = i + 5
        break
if start_btn != -1:
    del ops_lines[start_btn:end_btn+1]

with open(file_ops, 'w', encoding='utf-8') as f:
    f.writelines(ops_lines)

# AuthorDashboardPage: Add Launch POS button
file_auth = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx"
with open(file_auth, 'r', encoding='utf-8') as f:
    auth_lines = f.readlines()

for i, line in enumerate(auth_lines):
    if "{evt.isInvite && evt.registration === 'Pending' && (" in line:
        pos_btn = """                      {evt.livePosEnabled && !evt.isPast && (
                          <button onClick={() => window.open('/pos/' + evt.id, '_blank')} className="ml-3 text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-full font-bold shadow flex items-center gap-1 inline-flex">
                             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Launch POS
                          </button>
                      )}
"""
        auth_lines.insert(i, pos_btn)
        break

with open(file_auth, 'w', encoding='utf-8') as f:
    f.writelines(auth_lines)

print("Updated POS UI!")
