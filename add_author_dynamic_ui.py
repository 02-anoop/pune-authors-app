with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

dynamic_fields_logic = '''  const { status, rejectionReason, name, email, phone, bio, photoUrl, transactionId, paymentScreenshot, extraData } = dashboardData.authorProfile;
  const dynamicFields = dashboardData.dynamicFields || [];

  const [extraDataState, setExtraDataState] = useState(extraData || {});
  const missingFields = dynamicFields.filter((f: any) => !extraDataState[f.name]);

  const handleSaveExtraData = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/profile/extra`, { extraData: extraDataState }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Information saved!');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to save information');
    }
  };

  if (status === 'Approved' && missingFields.length > 0) {
    return (
      <div className="min-h-screen bg-paa-cream font-sans flex items-center justify-center p-6">
        <div className="bg-white max-w-lg w-full p-8 rounded border border-paa-navy/10 shadow-sm">
          <h2 className="text-xl font-serif text-paa-navy mb-4 border-b pb-2">Action Required</h2>
          <p className="text-sm text-gray-600 mb-6">The administration requires some additional information to complete your profile setup. Please fill out the following fields to proceed to your dashboard.</p>
          <div className="space-y-4 mb-6">
            {missingFields.map((f: any) => (
              <div key={f.name}>
                <label className="block text-xs font-bold uppercase tracking-widest text-paa-navy mb-1">{f.name}</label>
                {f.type === 'number' ? (
                  <input type="number" className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" value={extraDataState[f.name] || ''} onChange={e => setExtraDataState({...extraDataState, [f.name]: e.target.value})} />
                ) : f.type === 'date' ? (
                  <input type="date" className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" value={extraDataState[f.name] || ''} onChange={e => setExtraDataState({...extraDataState, [f.name]: e.target.value})} />
                ) : (
                  <input type="text" className="w-full border border-paa-navy/20 p-2 text-sm outline-none bg-gray-50 focus:border-paa-navy" value={extraDataState[f.name] || ''} onChange={e => setExtraDataState({...extraDataState, [f.name]: e.target.value})} />
                )}
              </div>
            ))}
          </div>
          <button onClick={handleSaveExtraData} className="w-full py-3 bg-paa-navy text-paa-cream text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors">Save & Continue</button>
        </div>
      </div>
    );
  }

  if (status === 'Pending' || status === 'Rejected') {'''

old_logic = '''  const { status, rejectionReason, name, email, phone, bio, photoUrl, transactionId, paymentScreenshot } = dashboardData.authorProfile;

  if (status === 'Pending' || status === 'Rejected') {'''

content = content.replace(old_logic, dynamic_fields_logic)

old_bio = '''          <div className="mb-4">
            <span className="text-gray-500 block text-xs uppercase font-bold mb-1">Bio</span>
            <p className="text-sm bg-gray-50 p-3 rounded">{bio}</p>
          </div>'''

new_bio = '''          <div className="mb-4">
            <span className="text-gray-500 block text-xs uppercase font-bold mb-1">Bio</span>
            <p className="text-sm bg-gray-50 p-3 rounded">{bio}</p>
          </div>
          {extraData && Object.keys(extraData).length > 0 && (
            <div className="mt-4">
               <h4 className="text-xs font-bold uppercase tracking-widest text-paa-navy border-b pb-1 mb-3">Additional Details</h4>
               <div className="grid grid-cols-2 gap-4 text-sm">
                 {Object.entries(extraData).map(([key, val]) => (
                    <div key={key}><span className="text-gray-500 block text-xs uppercase font-bold">{key}</span> {String(val)}</div>
                 ))}
               </div>
            </div>
          )}'''
content = content.replace(old_bio, new_bio)

with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AuthorDashboardPage.tsx with dynamic fields")
