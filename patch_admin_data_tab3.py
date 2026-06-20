import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update addField
content = content.replace(
    "const addField = () => setFields([...fields, { name: '', type: 'text', required: true }]);",
    "const addField = () => setFields([...fields, { name: '', type: 'text', required: true, requiredForRegistration: false }]);"
)

# 2. Add checkbox to UI
old_field_row = """              <div key={i} className="flex items-center gap-4 bg-gray-50 p-3 rounded border border-paa-navy/10">
                <input 
                  className="border border-paa-navy/20 p-2 text-sm flex-1 outline-none focus:border-paa-navy bg-white" 
                  placeholder="Field Name (e.g. Aadhar Number)" 
                  value={f.name} 
                  onChange={e => { const nf = [...fields]; nf[i].name = e.target.value; setFields(nf); }} 
                />
                <select 
                  className="border border-paa-navy/20 p-2 text-sm outline-none focus:border-paa-navy bg-white" 
                  value={f.type} 
                  onChange={e => { const nf = [...fields]; nf[i].type = e.target.value; setFields(nf); }}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                </select>
                <button className="text-red-500 text-xs font-bold uppercase tracking-widest hover:text-red-700" onClick={() => setFields(fields.filter((_, idx) => idx !== i))}>Remove</button>
              </div>"""

new_field_row = """              <div key={i} className="flex flex-col gap-3 bg-gray-50 p-4 rounded border border-paa-navy/10">
                <div className="flex items-center gap-4">
                  <input 
                    className="border border-paa-navy/20 p-2 text-sm flex-1 outline-none focus:border-paa-navy bg-white" 
                    placeholder="Field Name (e.g. Aadhar Number)" 
                    value={f.name} 
                    onChange={e => { const nf = [...fields]; nf[i].name = e.target.value; setFields(nf); }} 
                  />
                  <select 
                    className="border border-paa-navy/20 p-2 text-sm outline-none focus:border-paa-navy bg-white" 
                    value={f.type} 
                    onChange={e => { const nf = [...fields]; nf[i].type = e.target.value; setFields(nf); }}
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                  </select>
                  <button className="text-red-500 text-xs font-bold uppercase tracking-widest hover:text-red-700" onClick={() => setFields(fields.filter((_, idx) => idx !== i))}>Remove</button>
                </div>
                <div className="flex items-center gap-2 px-1">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-paa-navy cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="accent-paa-navy w-4 h-4"
                      checked={f.requiredForRegistration || false} 
                      onChange={e => { const nf = [...fields]; nf[i].requiredForRegistration = e.target.checked; setFields(nf); }} 
                    />
                    Require during initial Registration
                  </label>
                </div>
              </div>"""

content = content.replace(old_field_row, new_field_row)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
