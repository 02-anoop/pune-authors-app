import os

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1. Add eventSearch state right under authorSearch state
eventSearch_idx = -1
for i, line in enumerate(lines):
    if "const [authorSearch, setAuthorSearch] = useState('');" in line:
        lines.insert(i + 1, "  const [eventSearch, setEventSearch] = useState('');\n")
        break

# 2. Add Search bar above the main events table
table_container_idx = -1
for i, line in enumerate(lines):
    if "<div className=\"overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm animate-in fade-in duration-500\">" in line:
        table_container_idx = i
        break

search_ui = """        <div className="flex justify-between items-center mb-4 mt-8">
            <h4 className="font-bold text-gray-700">Events Registry</h4>
            <input 
                type="text" 
                placeholder="Search events..." 
                className="border border-gray-300 rounded-lg p-2 text-sm w-64 outline-none focus:border-paa-navy shadow-sm"
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
            />
        </div>
"""
if table_container_idx != -1:
    lines.insert(table_container_idx, search_ui)

# 3. Add column headers
for i, line in enumerate(lines):
    if "<th className=\"p-4 font-bold\">Location</th>" in line:
        lines.insert(i + 1, "                <th className=\"p-4 font-bold\">Duration</th>\n                <th className=\"p-4 font-bold text-right\">Charges</th>\n")
        break

# 4. Filter the mapping and add column body data
for i, line in enumerate(lines):
    if "{allCombinedEvents.map((evt: any, i: number) => {" in line:
        lines[i] = "               {allCombinedEvents.filter(evt => evt.name.toLowerCase().includes(eventSearch.toLowerCase())).map((evt: any, i: number) => {\n"
    if "<td className=\"p-4 text-sm text-gray-600\">{evt.location || evt.address || 'Location TBA'}</td>" in line:
        lines.insert(i + 1, "                  <td className=\"p-4 text-sm text-gray-600\">{evt.duration || '1'} Days</td>\n                  <td className=\"p-4 font-mono text-sm text-right\">₹{evt.registrationFee || evt.charges || 0}</td>\n")
        break

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Added admin events table columns and search!")
