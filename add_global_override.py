import os

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1. Insert new state variables at line 166
state_vars = """  const [useGlobalOverride, setUseGlobalOverride] = useState(false);
  const [globalSold, setGlobalSold] = useState(0);
  const [globalRevenue, setGlobalRevenue] = useState(0);
"""
lines.insert(166, state_vars)

# 2. Update handleEditAuthorData
for i, line in enumerate(lines):
    if "setManageAuthorBooks((author.books || []).map((b: any) => ({" in line:
        lines.insert(i, "        setUseGlobalOverride(false);\n        setGlobalSold(0);\n        setGlobalRevenue(0);\n")
        break

# 3. Update handlePublishData payload
payload_start = -1
for i, line in enumerate(lines):
    if "booksData: manageAuthorBooks" in line:
        payload_start = i
        break
if payload_start != -1:
    lines[payload_start] = """                booksData: manageAuthorBooks,
                useGlobalOverride,
                globalSold,
                globalRevenue
"""

# 4. Update the render view
book_sales_header = -1
for i, line in enumerate(lines):
    if "<h4 className=\"font-semibold text-paa-navy mb-4 border-b border-gray-200 pb-2\">Book Sales & Metrics</h4>" in line:
        book_sales_header = i
        break

global_override_ui = """
                     <div className="mb-4">
                        <label className="flex items-center gap-2 text-sm font-bold text-paa-navy cursor-pointer bg-paa-gold/10 p-3 rounded-lg border border-paa-gold/30">
                           <input type="checkbox" className="w-4 h-4 rounded text-paa-navy" checked={useGlobalOverride} onChange={(e) => setUseGlobalOverride(e.target.checked)} />
                           Use Global Override (No book-wise breakdown available)
                        </label>
                     </div>
                     
                     {useGlobalOverride ? (
                         <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
                             <div>
                                 <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Total Books Sold (Overall)</label>
                                 <input type="number" className="w-full border border-gray-300 rounded p-2 font-mono" value={globalSold} onChange={(e) => setGlobalSold(parseInt(e.target.value) || 0)} />
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-emerald-600 mb-1 uppercase tracking-wider">Total Revenue (₹)</label>
                                 <input type="number" className="w-full border border-emerald-200 bg-emerald-50 text-emerald-700 rounded p-2 font-mono font-bold" value={globalRevenue} onChange={(e) => setGlobalRevenue(parseInt(e.target.value) || 0)} />
                             </div>
                         </div>
                     ) : (
"""

if book_sales_header != -1:
    lines.insert(book_sales_header + 1, global_override_ui)

# 5. Close the bracket for useGlobalOverride ternary
div_end_idx = -1
for i in range(book_sales_header, len(lines)):
    if "<div className=\"mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3 items-center\">" in lines[i]:
        div_end_idx = i
        break

if div_end_idx != -1:
    lines.insert(div_end_idx, "                     )}\n")

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Added Global Override UI!")
