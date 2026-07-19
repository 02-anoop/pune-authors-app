import re

with open('src/app/components/OperationsDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. First, remove the duplicate SettingsTab I added at the end.
# It starts with "  const SettingsTab = () => {\n    const [fields, setFields] = useState"
# and ends right before "  if (loading) {"

duplicate_pattern = r"  const SettingsTab = \(\) => \{\n    const \[fields, setFields\].*?  if \(loading\) \{"
content = re.sub(duplicate_pattern, "  if (loading) {", content, flags=re.DOTALL)

# 2. Now replace the OLD SettingsTab
old_settings_pattern = r"  const SettingsTab = \(\) => \(\n    <div className=\"bg-white p-8 border border-paa-navy/10 shadow-sm max-w-2xl\">.*?    </div>\n  \);"

new_settings = '''  const SettingsTab = () => {
    const [fields, setFields] = useState<any[]>([]);
    useEffect(() => {
      axios.get(`${API}/api/admin/author-fields`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        .then(res => setFields(res.data));
    }, []);

    const addField = () => setFields([...fields, { name: '', type: 'text', required: true }]);
    
    const saveFields = () => {
      axios.post(`${API}/api/admin/author-fields`, { fields }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        .then(() => alert('Fields saved!'))
        .catch(() => alert('Failed to save'));
    };

    return (
    <div className="space-y-8 max-w-2xl">
      <div className="bg-white p-8 border border-paa-navy/10 shadow-sm">
         <div className="border-b border-paa-navy/10 pb-4 mb-8">
            <h2 className="text-xl font-serif font-medium text-paa-navy mb-1">System Settings</h2>
            <p className="text-paa-gray-text text-sm">Configure global application parameters, notification rules, and access control here.</p>
         </div>
         
         <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-paa-navy mb-2">Platform Name</label>
              <input type="text" defaultValue="Pune Authors' Association" className="w-full border border-paa-navy/20 bg-gray-50 rounded-none p-3 text-sm outline-none focus:border-paa-navy focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-paa-navy mb-2">Support Email</label>
              <input type="email" defaultValue="support@puneauthors.com" className="w-full border border-paa-navy/20 bg-gray-50 rounded-none p-3 text-sm outline-none focus:border-paa-navy focus:bg-white transition-colors" />
            </div>
            
            <div className="pt-6 border-t border-paa-navy/10">
              <h3 className="text-xs font-bold tracking-widest uppercase text-paa-navy mb-4">Default Email Notifications</h3>
              <div className="space-y-4 bg-gray-50 p-4 border border-paa-navy/10">
                 <label className="flex items-center gap-3 text-sm font-medium text-paa-navy cursor-pointer">
                   <input type="checkbox" defaultChecked className="w-4 h-4 accent-paa-navy" /> New Author Registered Alert
                 </label>
                 <label className="flex items-center gap-3 text-sm font-medium text-paa-navy cursor-pointer">
                   <input type="checkbox" defaultChecked className="w-4 h-4 accent-paa-navy" /> Book Out of Stock Alert
                 </label>
                 <label className="flex items-center gap-3 text-sm font-medium text-paa-navy cursor-pointer">
                   <input type="checkbox" defaultChecked className="w-4 h-4 accent-paa-navy" /> Event Registration Alert
                 </label>
              </div>
            </div>
         </div>
      </div>

      <div className="bg-white p-8 border border-paa-navy/10 shadow-sm">
        <h3 className="text-xl font-serif font-medium text-paa-navy mb-1">Author Dynamic Fields</h3>
        <p className="text-paa-gray-text text-sm mb-6 border-b border-paa-navy/10 pb-4">Define extra information that all authors must provide. This will appear on their dashboard until filled.</p>
        
        <div className="space-y-4 mb-6">
          {fields.map((f, i) => (
            <div key={i} className="flex items-center gap-4 bg-gray-50 p-3 rounded border border-paa-navy/10">
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
          ))}
        </div>
        
        <div className="flex gap-4">
          <button onClick={addField} className="px-4 py-2 border border-paa-navy text-paa-navy text-xs font-bold uppercase tracking-widest hover:bg-paa-navy hover:text-white transition-colors">Add Field</button>
          <button onClick={saveFields} className="px-4 py-2 bg-paa-navy text-white text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors">Save Fields Settings</button>
        </div>
      </div>
    </div>
    );
  };'''

content = re.sub(old_settings_pattern, new_settings, content, flags=re.DOTALL)

with open('src/app/components/OperationsDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed SettingsTab duplicate and merged logic.")
