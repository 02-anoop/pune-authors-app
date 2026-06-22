with open('src/app/components/OperationsDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

settings_tab = '''  const SettingsTab = () => {
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
      <div className="bg-white p-6 border border-paa-navy/10 shadow-sm">
        <h3 className="text-lg font-serif text-paa-navy mb-4">Author Dynamic Fields</h3>
        <p className="text-sm text-gray-500 mb-6">Define extra information that all authors must provide. This will appear on their dashboard until filled.</p>
        
        <div className="space-y-4 mb-6">
          {fields.map((f, i) => (
            <div key={i} className="flex items-center gap-4 bg-gray-50 p-3 rounded border border-paa-navy/10">
              <input 
                className="border border-paa-navy/20 p-2 text-sm flex-1 outline-none focus:border-paa-navy" 
                placeholder="Field Name (e.g. Aadhar Number)" 
                value={f.name} 
                onChange={e => { const nf = [...fields]; nf[i].name = e.target.value; setFields(nf); }} 
              />
              <select 
                className="border border-paa-navy/20 p-2 text-sm outline-none focus:border-paa-navy" 
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
          <button onClick={saveFields} className="px-4 py-2 bg-paa-navy text-white text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors">Save Settings</button>
        </div>
      </div>
    );
  };

  if (loading) {'''

content = content.replace('  if (loading) {', settings_tab)

with open('src/app/components/OperationsDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added SettingsTab to OperationsDashboardPage.tsx")
