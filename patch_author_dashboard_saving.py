import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add isSavingExtraData state
if "const [isSavingExtraData, setIsSavingExtraData] = useState(false);" not in content:
    content = content.replace(
        "const [hasNewOrders, setHasNewOrders] = useState(false);",
        "const [hasNewOrders, setHasNewOrders] = useState(false);\n  const [isSavingExtraData, setIsSavingExtraData] = useState(false);"
    )

# 2. Update handleSaveExtraData to use setIsSavingExtraData
old_handle_save = """  const handleSaveExtraData = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/profile/extra`, { extraData: extraDataState }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Information saved!');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to save information');
    }
  };"""

new_handle_save = """  const handleSaveExtraData = async () => {
    try {
      setIsSavingExtraData(true);
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/profile/extra`, { extraData: extraDataState }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Information saved!');
      await fetchDashboardData();
    } catch (err) {
      toast.error('Failed to save information');
    } finally {
      setIsSavingExtraData(false);
    }
  };"""

if "setIsSavingExtraData(true);" not in content:
    content = content.replace(old_handle_save, new_handle_save)

# 3. Update the button to show the loading state
old_button = """<button onClick={handleSaveExtraData} className="w-full py-3 bg-paa-navy text-paa-cream text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors">Save & Continue</button>"""
new_button = """<button onClick={handleSaveExtraData} disabled={isSavingExtraData} className={`w-full py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${isSavingExtraData ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-paa-navy text-paa-cream hover:bg-paa-gold hover:text-paa-navy'}`}>{isSavingExtraData ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving Data...</> : 'Save & Continue'}</button>"""

if "Saving Data..." not in content:
    content = content.replace(old_button, new_button)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
