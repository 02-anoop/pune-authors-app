import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = r'c:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f'Total lines before: {len(lines)}')

# ── STEP 1: Find & remove the stray lines at 4274-4276 (0-indexed: 4273-4275)
# Line 4274 (idx 4273): '                \n'
# Line 4275 (idx 4274): '                   </select>\n'
# Line 4276 (idx 4275): '                </div>\n'
# Line 4277 (idx 4276): '             </div>\n'
# Line 4278 (idx 4277): '          </div>\n'
# We want to REPLACE lines 4274-4278 (inclusive) with the dropdown IIFE + closing divs

dropdown_iife = '''                 {/* ── Premium Sort Dropdown ── */}
                 {(() => {
                   const sortOptions = [
                     { value: 'date_desc',          label: 'Newest First',        icon: '\u2193' },
                     { value: 'date_asc',           label: 'Oldest First',        icon: '\u2191' },
                     { value: 'revenue_desc',       label: 'Highest Revenue',     icon: '\u20b9' },
                     { value: 'revenue_asc',        label: 'Lowest Revenue',      icon: '\u20b9' },
                     { value: 'sold_desc',          label: 'Most Copies Sold',    icon: '\U0001f4e6' },
                     { value: 'participation_desc', label: 'Top Participation %', icon: '%' },
                   ];
                   const selectedOption = sortOptions.find(o => o.value === bpSort) || sortOptions[0];
                   const [sortOpen, setSortOpen] = React.useState(false);
                   return (
                     <div className="relative" id="events-sort-dropdown">
                       <button
                         onClick={() => setSortOpen(v => !v)}
                         className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-4 shadow-sm h-[38px] hover:border-indigo-300 hover:shadow-md transition-all duration-200 min-w-[200px] justify-between"
                       >
                         <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] hidden sm:block">Sort</span>
                           <span className="w-px h-3.5 bg-gray-200 hidden sm:block"></span>
                           <span className="text-xs font-bold text-paa-navy">{selectedOption.label}</span>
                         </div>
                         <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                         </svg>
                       </button>
                       {sortOpen && (
                         <>
                           <div className="fixed inset-0 z-[49]" onClick={() => setSortOpen(false)} />
                           <div className="absolute right-0 top-[calc(100%+6px)] z-50 bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden min-w-[215px] animate-fade-in-up">
                             <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                               <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em]">Sort Events By</span>
                             </div>
                             <div className="py-1.5">
                               {sortOptions.map((opt) => (
                                 <button
                                   key={opt.value}
                                   onClick={() => { setBpSort(opt.value); setSortOpen(false); }}
                                   className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 group/item ${
                                     bpSort === opt.value
                                       ? 'bg-indigo-50 text-indigo-700'
                                       : 'text-gray-700 hover:bg-gray-50'
                                   }`}
                                 >
                                   <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${
                                     bpSort === opt.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 group-hover/item:bg-gray-200'
                                   }`}>{opt.icon}</span>
                                   <span className="text-[12px] font-semibold flex-1">{opt.label}</span>
                                   {bpSort === opt.value && (
                                     <svg className="w-3.5 h-3.5 text-indigo-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                       <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                     </svg>
                                   )}
                                 </button>
                               ))}
                             </div>
                           </div>
                         </>
                       )}
                     </div>
                   );
                 })()}
              </div>
           </div>
'''

# Replace lines 4273-4277 (0-indexed) = lines 4274-4278 (1-indexed) with dropdown
# That's 5 lines to replace with our dropdown block
replacement_lines = dropdown_iife.splitlines(keepends=True)

# Splice: keep everything before idx 4273, then add dropdown, then skip to idx 4278
new_lines = lines[:4273] + replacement_lines + lines[4278:]

print(f'Total lines after step 1: {len(new_lines)}')

# ── STEP 2: Find and fix the second bad block in the modal
# Search for the pattern: label containing the sort dropdown inside proposeEventForm context
# We need to find the line that starts the corrupt label in the modal
# After step 1, line numbers have shifted. Re-search.

corrupt_start = None
corrupt_end = None
for i, line in enumerate(new_lines):
    if 'Premium Sort Dropdown' in line and i > 4400:
        corrupt_start = i
        print(f'Found corrupt block start at line {i+1}')
        break

if corrupt_start is not None:
    # Look backwards to find the opening <label> tag
    for j in range(corrupt_start, max(0, corrupt_start - 5), -1):
        if '<label className="dash-label">' in new_lines[j] and '</label>' not in new_lines[j]:
            corrupt_start = j
            break
    # Look forwards to find the closing </label> tag
    for j in range(corrupt_start, min(len(new_lines), corrupt_start + 120)):
        if '</label>' in new_lines[j]:
            corrupt_end = j
            print(f'Found corrupt block end (</label>) at line {j+1}')
            break

    if corrupt_end is not None:
        # Replace the corrupt label block with the correct simple label
        correct_label = '                   <label className="dash-label">Event Type *</label>\n'
        print(f'Replacing lines {corrupt_start+1} to {corrupt_end+1} with correct label')
        new_lines = new_lines[:corrupt_start] + [correct_label] + new_lines[corrupt_end+1:]
        print(f'Total lines after step 2: {len(new_lines)}')
    else:
        print('WARNING: Could not find </label> end of corrupt block')
else:
    print('No second corrupt block found - good!')

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('Done! File written successfully.')
