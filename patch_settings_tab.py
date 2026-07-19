import re

with open('src/app/components/OperationsDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the SettingsTab definition
old_settings_tab = """  const SettingsTab = () => {


    return (
      <div className="space-y-8 max-w-2xl">
        <div className="bg-white p-8 border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out">
          <div className="border-b border-paa-navy/5 pb-4 mb-8">
            <h2 className="text-xl font-serif font-medium text-paa-navy mb-1">System Settings</h2>
            <p className="text-paa-gray-text text-sm">Configure global application parameters, notification rules, and access control here.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-paa-navy mb-2">Platform Name</label>
              <input type="text" defaultValue="Pune Authors' Association" className="w-full border border-paa-navy/20 bg-gray-50 rounded-3xl-2xl-none p-3 text-sm outline-none focus:border-paa-navy focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-paa-navy mb-2">Support Email</label>
              <input type="email" defaultValue="support@puneauthors.com" className="w-full border border-paa-navy/20 bg-gray-50 rounded-3xl-2xl-none p-3 text-sm outline-none focus:border-paa-navy focus:bg-white transition-colors" />
            </div>

            <div className="pt-6 border-t border-paa-navy/5">
              <h3 className="text-xs font-bold tracking-widest uppercase text-paa-navy mb-4">Default Email Notifications</h3>
              <div className="space-y-4 bg-gray-50 p-4 border border-paa-navy/5">
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


      </div>
    );
  };"""

new_settings_tab = """  const SettingsTab = () => {
    const [settings, setSettings] = useState({
      manualAuthorsCount: '',
      manualBooksCount: '',
      manualEventsCount: '',
      manualDonatedBooksCount: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
      axios.get(`${API}/api/admin/settings`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        .then(res => {
          if (res.data) {
            setSettings(prev => ({ ...prev, ...res.data }));
          }
        })
        .catch(err => console.error(err));
    }, []);

    const handleSave = async () => {
      setIsSaving(true);
      try {
        await axios.post(`${API}/api/admin/settings`, settings, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        toast.success("Settings saved successfully!");
      } catch (err) {
        toast.error("Failed to save settings");
      }
      setIsSaving(false);
    };

    return (
      <div className="space-y-8 max-w-2xl">
        <div className="bg-white p-8 border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out rounded-3xl-2xl">
          <div className="border-b border-paa-navy/5 pb-4 mb-8">
            <h2 className="text-xl font-serif font-medium text-paa-navy mb-1">System Settings</h2>
            <p className="text-paa-gray-text text-sm">Configure manual overrides for catalogue and landing page statistics here.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-paa-navy mb-2">Total Authors (Manual Override)</label>
              <input 
                type="number" 
                value={settings.manualAuthorsCount || ''} 
                onChange={(e) => setSettings({...settings, manualAuthorsCount: e.target.value})}
                placeholder="Leave blank for dynamic count"
                className="w-full border border-paa-navy/20 bg-gray-50 rounded-lg p-3 text-sm outline-none focus:border-paa-navy focus:bg-white transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-paa-navy mb-2">Total Books (Manual Override)</label>
              <input 
                type="number" 
                value={settings.manualBooksCount || ''} 
                onChange={(e) => setSettings({...settings, manualBooksCount: e.target.value})}
                placeholder="Leave blank for dynamic count"
                className="w-full border border-paa-navy/20 bg-gray-50 rounded-lg p-3 text-sm outline-none focus:border-paa-navy focus:bg-white transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-paa-navy mb-2">Total Events (Manual Override)</label>
              <input 
                type="number" 
                value={settings.manualEventsCount || ''} 
                onChange={(e) => setSettings({...settings, manualEventsCount: e.target.value})}
                placeholder="Leave blank for dynamic count"
                className="w-full border border-paa-navy/20 bg-gray-50 rounded-lg p-3 text-sm outline-none focus:border-paa-navy focus:bg-white transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-paa-navy mb-2">Total Donated Books (Manual Override)</label>
              <input 
                type="number" 
                value={settings.manualDonatedBooksCount || ''} 
                onChange={(e) => setSettings({...settings, manualDonatedBooksCount: e.target.value})}
                placeholder="Leave blank for dynamic count"
                className="w-full border border-paa-navy/20 bg-gray-50 rounded-lg p-3 text-sm outline-none focus:border-paa-navy focus:bg-white transition-colors" 
              />
            </div>
          </div>
          
          <div className="mt-8">
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="px-6 py-2 bg-paa-navy text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-paa-gold hover:text-paa-navy transition-all duration-300 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    );
  };"""

content = content.replace(old_settings_tab, new_settings_tab)

# Also fix the placeholder render if activeTab === 'settings'
old_placeholder = """            {activeTab === 'settings' && (
              <div className="p-8 text-center text-gray-500">
                <h2 className="text-2xl font-bold mb-2">System Settings</h2>
                <p>Settings panel coming soon...</p>
              </div>
            )}"""

new_placeholder = """            {activeTab === 'settings' && <SettingsTab />}"""

content = content.replace(old_placeholder, new_placeholder)

with open('src/app/components/OperationsDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
