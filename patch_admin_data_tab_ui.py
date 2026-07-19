import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add showColumnsMenu state
if "const [showColumnsMenu, setShowColumnsMenu] = useState(false);" not in content:
    content = content.replace(
        "const [selectedColumns, setSelectedColumns] = useState<string[]>([]);",
        "const [selectedColumns, setSelectedColumns] = useState<string[]>([]);\n    const [showColumnsMenu, setShowColumnsMenu] = useState(false);"
    )

# 2. Modify the "Columns to Display" section and the Action buttons
old_actions_and_columns = """            <div className="flex gap-4">
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
          )}"""

new_actions_and_columns = """            <div className="flex gap-3 items-center">
               {dynamicKeys.length > 0 && (
                 <div className="relative">
                   <button 
                     onClick={() => setShowColumnsMenu(!showColumnsMenu)}
                     className="px-3 py-2 border border-paa-navy/20 bg-gray-50 hover:bg-gray-100 rounded text-paa-navy transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-1"
                   >
                     Columns <ChevronDown className="w-4 h-4" />
                   </button>
                   {showColumnsMenu && (
                     <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded z-20 py-2">
                        {dynamicKeys.map(key => (
                          <label key={key} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-xs font-bold uppercase tracking-widest text-paa-navy cursor-pointer whitespace-nowrap">
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
                   )}
                 </div>
               )}
               <button onClick={handleExportCSV} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-widest rounded transition-colors shadow">
                  Export CSV
               </button>
               <button onClick={fetchAuthors} className="p-2 border border-paa-navy/20 bg-gray-50 hover:bg-gray-100 rounded text-paa-navy transition-colors shadow-sm">
                  <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
               </button>
            </div>
          </div>"""

if "Columns <ChevronDown" not in content:
    content = content.replace(old_actions_and_columns, new_actions_and_columns)

# Make sure ChevronDown is imported
if "ChevronDown" not in content:
    content = content.replace("from 'lucide-react';", ", ChevronDown } from 'lucide-react';")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
