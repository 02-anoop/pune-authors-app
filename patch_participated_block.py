import re

filepath = r'c:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to insert the Total Participated block right after the Total Registered block
registered_block_regex = re.compile(r'(<div className=\{`bg-gray-50 border rounded-xl p-4 shadow-sm flex flex-col justify-between \$\{isEditingKPIs \? "border-paa-navy/40 ring-1 ring-paa-navy/10" : "border-gray-200"`\}>.*?Total Registered.*?</div>\s*</div>)', re.DOTALL)

if registered_block_regex.search(content):
    registered_block = registered_block_regex.search(content).group(1)
    
    # We will just insert the Total Participated block after it
    participated_block = """
            <div className={`bg-gray-50 border rounded-xl p-4 shadow-sm flex flex-col justify-between ${isEditingKPIs ? "border-paa-navy/40 ring-1 ring-paa-navy/10" : "border-gray-200"}`}>
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Participated</div>
                {isEditingKPIs ? (<input type="text" className="text-xl font-serif text-paa-navy font-bold bg-transparent border-0 border-b-2 border-paa-navy/30 focus:border-paa-navy outline-none w-full p-0" value={selectedEventBreakdown.aggAuthors == null ? "" : selectedEventBreakdown.aggAuthors} placeholder="NA" onChange={e => { const val = e.target.value; setSelectedEventBreakdown({ ...selectedEventBreakdown, aggAuthors: (val.toUpperCase() === "NA" || val === "") ? null : parseInt(val) || 0 }) }} />) : (<div className="text-xl font-serif text-paa-navy font-bold">{selectedEventBreakdown.aggAuthors != null ? selectedEventBreakdown.aggAuthors : (totalAuthors === 'NA' ? 'NA' : totalAuthors)}</div>)}
              </div>
              {isPastOrArchive && !isEditingKPIs && totalAuthors !== 'NA' && (
                <div className="text-[10px] text-gray-500 font-bold uppercase mt-2 pt-2 border-t border-gray-200">Plat. Reg: <span className="text-paa-navy">{pubAuthors}</span></div>
              )}
            </div>
"""
    
    if "Total Participated" not in content:
        content = content.replace(registered_block, registered_block + participated_block)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Fixed missing Total Participated block.")
    else:
        print("Total Participated block already exists.")
else:
    print("Could not find Total Registered block.")
