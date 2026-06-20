import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update activeTab state type definition
if "'author_data'" not in content:
    content = content.replace(
        "useState<'overview' | 'authors' | 'books' | 'events' | 'orders' | 'settings' | 'forms' | 'gallery'>('overview');",
        "useState<'overview' | 'authors' | 'books' | 'events' | 'orders' | 'settings' | 'forms' | 'gallery' | 'author_data'>('overview');"
    )

# 2. Add AuthorDataTab component
author_data_tab_code = """

  const AuthorDataTab = () => {
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
  };

"""

# Inject before FormsTab or at the end
if "const AuthorDataTab = () => {" not in content:
    content = content.replace("  const FormsTab = () => (", author_data_tab_code + "\n  const FormsTab = () => (")

# 3. Add to sidebar
if "{ id: 'author_data', label: 'Author Extra Data', icon: ClipboardList }," not in content:
    content = content.replace(
        "{ id: 'settings', label: 'System Settings', icon: Settings },",
        "{ id: 'author_data', label: 'Author Extra Data', icon: ClipboardList },\n             { id: 'settings', label: 'System Settings', icon: Settings },"
    )

# 4. Add to activeTab switch
if "{activeTab === 'author_data' && <AuthorDataTab />}" not in content:
    content = content.replace(
        "{activeTab === 'settings' && <SettingsTab />}",
        "{activeTab === 'author_data' && <AuthorDataTab />}\n           {activeTab === 'settings' && <SettingsTab />}"
    )

# Add RefreshCw import if missing
if "RefreshCw" not in content:
    content = content.replace("import { \n", "import { RefreshCw, \n")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("AuthorDataTab successfully added to OperationsDashboardPage.tsx")
