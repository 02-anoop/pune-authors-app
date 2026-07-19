import sys

def fix_file():
    with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Part 1: Remove the Eye button from the expanded row
    target_button = """                                   <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
                                      <button onClick={() => { setActiveTab('details'); setSelectedEventId(evt.id.toString()); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-bold transition-colors shadow-sm">
                                         <Eye className="w-4 h-4" /> Full Details & Analytics
                                      </button>
                                      {evt.livePosEnabled && !evt.isPast && (
                                        <button onClick={() => window.open('/pos/' + evt.id, '_blank')} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-bold transition-colors shadow-sm whitespace-nowrap">
                                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Launch POS
                                        </button>
                                      )}
                                   </div>"""
                                   
    replacement_button = """                                   <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
                                      {evt.livePosEnabled && !evt.isPast && (
                                        <button onClick={() => window.open('/pos/' + evt.id, '_blank')} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-bold transition-colors shadow-sm whitespace-nowrap">
                                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Launch POS
                                        </button>
                                      )}
                                   </div>"""

    content = content.replace(target_button, replacement_button)

    # Part 2: Remove the entire Details tab
    # We find the start of the details block and the end of it.
    start_str = "      {activeTab === 'details' && ("
    end_str = "      {activeTab === 'performance' && ("
    
    idx1 = content.find(start_str)
    idx2 = content.find(end_str, idx1)
    
    if idx1 != -1 and idx2 != -1:
        # We replace the entire block between idx1 and idx2 with just the start of the performance block
        content = content[:idx1] + content[idx2:]
        print("REMOVED DETAILS TAB SUCCESSFULLY")
    else:
        print("COULD NOT FIND DETAILS TAB BLOCK")

    with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("SUCCESSFULLY REMOVED BUTTON")

if __name__ == '__main__':
    fix_file()
