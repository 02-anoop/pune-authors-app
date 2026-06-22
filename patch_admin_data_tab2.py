import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove Author Dynamic Fields from SettingsTab
settings_tab_fields_block = """      <div className="bg-white p-8 border border-paa-navy/10 shadow-sm">
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
      </div>"""

if settings_tab_fields_block in content:
    content = content.replace(settings_tab_fields_block, "")
    
# Remove fields state from SettingsTab
settings_state_block = """    const [fields, setFields] = useState<any[]>([]);
    useEffect(() => {
      axios.get(`${API}/api/admin/author-fields`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        .then(res => setFields(res.data));
    }, []);

    const addField = () => setFields([...fields, { name: '', type: 'text', required: true }]);
    
    const saveFields = () => {
      axios.post(`${API}/api/admin/author-fields`, { fields }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        .then(() => alert('Fields saved!'))
        .catch(() => alert('Failed to save'));
    };"""

if settings_state_block in content:
    content = content.replace(settings_state_block, "")

# 2. Replace AuthorDataTab
old_author_data_tab = """  const AuthorDataTab = () => {
    // Get all unique extraData keys from all authors to form table columns
    const dynamicKeys = Array.from(new Set(
      authors.reduce((acc: string[], author: any) => {
        if (author.extraData) {
          acc = acc.concat(Object.keys(author.extraData));
        }
        return acc;
      }, [])
    ));

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded border border-paa-navy/10 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-paa-navy uppercase tracking-widest flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-paa-gold" />
              Dynamic Author Data
            </h2>
            <p className="text-sm text-paa-gray-text mt-1">View the custom fields data filled out by authors.</p>
          </div>
          <div className="flex gap-4">
             <button onClick={fetchAuthors} className="p-2 border border-paa-navy/20 bg-gray-50 hover:bg-gray-100 rounded text-paa-navy transition-colors">
                <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
             </button>
          </div>
        </div>

        <div className="bg-white border border-paa-navy/10 rounded shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#e4ebf5] text-paa-navy uppercase tracking-widest text-xs border-b border-paa-navy/10">
                <tr>
                  <th className="px-6 py-4 font-bold">Author Name</th>
                  <th className="px-6 py-4 font-bold">Email</th>
                  {dynamicKeys.map(key => (
                    <th key={key} className="px-6 py-4 font-bold text-paa-gold">{key}</th>
                  ))}
                  {dynamicKeys.length === 0 && (
                    <th className="px-6 py-4 font-bold text-gray-400">No Custom Fields Filled Yet</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-paa-navy/5">
                {authors.length === 0 ? (
                  <tr><td colSpan={dynamicKeys.length + 2} className="px-6 py-8 text-center text-gray-500 italic">No authors found.</td></tr>
                ) : authors.map(author => (
                  <tr key={author.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-6 py-4 font-medium text-paa-navy">{author.name}</td>
                    <td className="px-6 py-4 text-gray-500">{author.email}</td>
                    {dynamicKeys.map(key => (
                      <td key={key} className="px-6 py-4 text-gray-700">
                        {author.extraData && author.extraData[key] ? String(author.extraData[key]) : <span className="text-gray-300 italic">-</span>}
                      </td>
                    ))}
                    {dynamicKeys.length === 0 && <td className="px-6 py-4"></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };"""

new_author_data_tab = """  const AuthorDataTab = () => {
    const [fields, setFields] = useState<any[]>([]);
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    
    // Get all unique extraData keys from all authors to form table columns
    const dynamicKeys = Array.from(new Set(
      authors.reduce((acc: string[], author: any) => {
        if (author.extraData) {
          acc = acc.concat(Object.keys(author.extraData));
        }
        return acc;
      }, [])
    ));

    useEffect(() => {
      axios.get(`${API}/api/admin/author-fields`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        .then(res => setFields(res.data));
    }, []);

    // Initialize all columns as selected
    useEffect(() => {
      if (selectedColumns.length === 0 && dynamicKeys.length > 0) {
        setSelectedColumns(dynamicKeys);
      }
    }, [dynamicKeys.length]);

    const addField = () => setFields([...fields, { name: '', type: 'text', required: true }]);
    
    const saveFields = () => {
      axios.post(`${API}/api/admin/author-fields`, { fields }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        .then(() => toast.success('Fields saved successfully!'))
        .catch(() => toast.error('Failed to save fields'));
    };

    const handleColumnToggle = (col: string) => {
      if (selectedColumns.includes(col)) {
        setSelectedColumns(selectedColumns.filter(c => c !== col));
      } else {
        setSelectedColumns([...selectedColumns, col]);
      }
    };

    const handleExportCSV = () => {
      let csv = 'Author Name,Email';
      selectedColumns.forEach(col => csv += `,${col}`);
      csv += '\\n';

      authors.forEach(author => {
        csv += `"${author.name}","${author.email}"`;
        selectedColumns.forEach(col => {
          const val = author.extraData && author.extraData[col] ? String(author.extraData[col]).replace(/"/g, '""') : '';
          csv += `,"${val}"`;
        });
        csv += '\\n';
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'author_extra_data_report.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div className="space-y-8 max-w-6xl">
        <div className="bg-white p-6 border border-paa-navy/10 shadow-sm rounded">
          <h3 className="text-xl font-serif font-medium text-paa-navy mb-1">Author Dynamic Fields Management</h3>
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
            {fields.length === 0 && <p className="text-sm text-gray-500 italic">No dynamic fields created yet.</p>}
          </div>
          
          <div className="flex gap-4">
            <button onClick={addField} className="px-4 py-2 border border-paa-navy text-paa-navy text-xs font-bold uppercase tracking-widest hover:bg-paa-navy hover:text-white transition-colors">Add Field</button>
            <button onClick={saveFields} className="px-4 py-2 bg-paa-navy text-white text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors">Save Fields Settings</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded border border-paa-navy/10 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-paa-navy uppercase tracking-widest flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-paa-gold" />
                Author Data Report
              </h2>
              <p className="text-sm text-paa-gray-text mt-1">View and export the custom fields data filled out by authors.</p>
            </div>
            <div className="flex gap-4">
               <button onClick={handleExportCSV} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-widest rounded transition-colors">
                  Export CSV
               </button>
               <button onClick={fetchAuthors} className="p-2 border border-paa-navy/20 bg-gray-50 hover:bg-gray-100 rounded text-paa-navy transition-colors">
                  <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
               </button>
            </div>
          </div>

          {dynamicKeys.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 border border-paa-navy/10 rounded">
              <p className="text-xs font-bold uppercase tracking-widest text-paa-navy mb-3">Columns to Display:</p>
              <div className="flex flex-wrap gap-4">
                {dynamicKeys.map(key => (
                  <label key={key} className="flex items-center gap-2 text-sm text-paa-navy cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="accent-paa-navy"
                      checked={selectedColumns.includes(key)} 
                      onChange={() => handleColumnToggle(key)} 
                    />
                    {key}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="border border-paa-navy/10 rounded shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#e4ebf5] text-paa-navy uppercase tracking-widest text-xs border-b border-paa-navy/10">
                  <tr>
                    <th className="px-6 py-4 font-bold">Author Name</th>
                    <th className="px-6 py-4 font-bold">Email</th>
                    {dynamicKeys.filter(k => selectedColumns.includes(k)).map(key => (
                      <th key={key} className="px-6 py-4 font-bold text-paa-gold">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-paa-navy/5">
                  {authors.length === 0 ? (
                    <tr><td colSpan={selectedColumns.length + 2} className="px-6 py-8 text-center text-gray-500 italic">No authors found.</td></tr>
                  ) : authors.map(author => (
                    <tr key={author.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-6 py-4 font-medium text-paa-navy">{author.name}</td>
                      <td className="px-6 py-4 text-gray-500">{author.email}</td>
                      {dynamicKeys.filter(k => selectedColumns.includes(k)).map(key => (
                        <td key={key} className="px-6 py-4 text-gray-700">
                          {author.extraData && author.extraData[key] ? String(author.extraData[key]) : <span className="text-gray-300 italic">-</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };"""

content = content.replace(old_author_data_tab, new_author_data_tab)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
