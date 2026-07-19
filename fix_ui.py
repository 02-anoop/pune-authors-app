import os
import re

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add animate-ping and animate-pulse for pending notifications
content = content.replace(
    '<span className="absolute right-4 w-2 h-2 bg-red-500 rounded-full"></span>',
    '<span className="absolute right-4 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75"></span><span className="absolute right-4 w-2 h-2 bg-red-500 rounded-full"></span>'
)
content = content.replace(
    '<span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>',
    '<span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-ping opacity-75"></span><span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>'
)
content = content.replace(
    '<AlertCircle className="w-5 h-5 text-amber-500" /> Pending Actions',
    '<AlertCircle className="w-5 h-5 text-amber-500 animate-pulse" /> Pending Actions'
)

# 2. Fix fetchEventReport for legacy events to allow NA
content = content.replace(
    'authorsParticipated: legacyEvt.authorsParticipated || 0,',
    'authorsParticipated: legacyEvt.authorsParticipated,'
)
content = content.replace(
    'booksSold: legacyEvt.booksSold || 0',
    'booksSold: legacyEvt.booksSold'
)
content = content.replace(
    '<p className="text-4xl font-black text-paa-navy">{eventReportData[0].authorsParticipated}</p>',
    '<p className="text-4xl font-black text-paa-navy">{eventReportData[0].authorsParticipated || "NA"}</p>'
)
content = content.replace(
    '<p className="text-4xl font-black text-paa-navy">{eventReportData[0].booksSold}</p>',
    '<p className="text-4xl font-black text-paa-navy">{eventReportData[0].booksSold || "NA"}</p>'
)

# 3. Merge Legacy Archive into the main Past Events rendering
legacy_block_pattern = r'       <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 border-b pb-2 mt-12">Past Events Archive</h4>\n       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">\n          \{pastEventsData\.map\(\(evt: any\) => \(\n             <div key=\{\'legacy_\'\+evt\.id\}.*?\n          \}\)\)'

# First, find and remove the legacy block using re.sub (non-greedy)
content = re.sub(r'       <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 border-b pb-2 mt-12">Past Events Archive</h4>\n       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">\n          \{pastEventsData\.map\(\(evt: any\) => \(.*?\}\)\)\n', 
                 r'       <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 border-b pb-2 mt-12">Past Events Archive</h4>\n       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">\n', 
                 content, flags=re.DOTALL)

# Then replace the events.filter('Past').map block with a combined one
old_map = "events.filter(e => e.status === 'Past').map((evt) => ("
new_map = """[...pastEventsData.map((evt: any) => ({...evt, id: 'legacy_'+evt.id, isLegacy: true, status: 'Legacy Archive', _count: { eventAuthors: evt.authorsParticipated, eventBooks: evt.booksSold }})), ...events.filter(e => e.status === 'Past')].map((evt: any) => ("""
content = content.replace(old_map, new_map)

# Add conditional check for Edit/Delete buttons (so legacy events can't be edited)
content = content.replace(
    '<button onClick={() => handleEditEventClick(evt)} className="p-1 hover:bg-white/20 rounded-3xl-2xl transition-colors" title="Edit Event"><Edit className="w-3 h-3" /></button>',
    '{!evt.isLegacy && <button onClick={() => handleEditEventClick(evt)} className="p-1 hover:bg-white/20 rounded-3xl-2xl transition-colors" title="Edit Event"><Edit className="w-3 h-3" /></button>}'
)
content = content.replace(
    '<button onClick={() => handleDeleteEvent(evt.id)} className="p-1 hover:bg-white/20 text-red-200 hover:text-red-100 rounded-3xl-2xl transition-colors" title="Delete Event"><Trash2 className="w-3 h-3" /></button>',
    '{!evt.isLegacy && <button onClick={() => handleDeleteEvent(evt.id)} className="p-1 hover:bg-white/20 text-red-200 hover:text-red-100 rounded-3xl-2xl transition-colors" title="Delete Event"><Trash2 className="w-3 h-3" /></button>}'
)

# Update "evt.location" to fallback to "evt.address" for legacy events
content = content.replace(
    '<p className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-400"/> {evt.location}</p>',
    '<p className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-400"/> {evt.location || evt.address}</p>'
)

# Render "NA" for missing counts in the card layout
content = content.replace(
    '<p className="text-lg font-black text-gray-700">{evt._count?.eventAuthors || 0}</p>',
    '<p className="text-lg font-black text-gray-700">{evt._count?.eventAuthors || (evt.isLegacy ? "NA" : 0)}</p>'
)
content = content.replace(
    '<p className="text-lg font-black text-gray-700">{evt._count?.eventBooks || 0}</p>',
    '<p className="text-lg font-black text-gray-700">{evt._count?.eventBooks || (evt.isLegacy ? "NA" : 0)}</p>'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done!")
