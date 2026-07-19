import os

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

state_vars = """
  const [showAuthorDataModal, setShowAuthorDataModal] = useState(false);
  const [selectedEventForData, setSelectedEventForData] = useState<any>(null);
  const [selectedAuthorForData, setSelectedAuthorForData] = useState('');
"""

modal_jsx = """
      <Modal isOpen={showAuthorDataModal} onClose={() => setShowAuthorDataModal(false)} title="Manage Author Data & Publish">
         <div className="space-y-6">
           <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Event</label>
              <select 
                 className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-paa-navy"
                 value={selectedEventForData?.id || ''}
                 onChange={(e) => {
                     const evt = [...events, ...pastEventsData].find((ev: any) => ev.id.toString() === e.target.value);
                     setSelectedEventForData(evt);
                 }}
              >
                 <option value="">-- Select Event --</option>
                 {events.map((evt: any) => (
                    <option key={evt.id} value={evt.id}>{evt.name} (Active)</option>
                 ))}
                 {pastEventsData.map((evt: any) => (
                    <option key={evt.id} value={evt.id}>{evt.name} (Past/Legacy)</option>
                 ))}
              </select>
           </div>
           
           <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Author to Edit</label>
              <select 
                 className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-paa-navy"
                 value={selectedAuthorForData}
                 onChange={(e) => setSelectedAuthorForData(e.target.value)}
              >
                 <option value="">-- Select Author --</option>
                 {authors.map((a: any) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                 ))}
              </select>
           </div>
           
           {selectedAuthorForData && selectedEventForData && (
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                 <h4 className="font-semibold text-paa-navy mb-4">Author Event Details</h4>
                 <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                       <label className="block text-xs font-bold text-gray-600 mb-1">Registration Status</label>
                       <select className="w-full border border-gray-300 rounded p-2 text-sm"><option>Registered</option><option>Participated</option><option>Declined</option></select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-600 mb-1">Payment Status</label>
                       <select className="w-full border border-gray-300 rounded p-2 text-sm"><option>Paid</option><option>Unpaid</option><option>-</option></select>
                    </div>
                 </div>
                 
                 <h4 className="font-semibold text-paa-navy mb-4">Book Sales & Metrics</h4>
                 <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                       <div className="flex justify-between items-center p-3 bg-white border-b border-gray-100">
                          <div className="font-medium text-sm">Example Book Title</div>
                          <label className="flex items-center gap-2 text-xs">
                             <input type="checkbox" defaultChecked className="rounded text-paa-navy" /> Listed
                          </label>
                       </div>
                       <div className="p-4 bg-gray-50 grid grid-cols-2 md:grid-cols-5 gap-3">
                          <div>
                             <label className="block text-[10px] font-bold text-gray-500 mb-1">Copies Sent</label>
                             <input type="number" defaultValue="50" className="w-full border border-gray-300 rounded p-1.5 text-sm" />
                          </div>
                          <div>
                             <label className="block text-[10px] font-bold text-gray-500 mb-1">Manual Sold</label>
                             <input type="number" defaultValue="20" className="w-full border border-gray-300 rounded p-1.5 text-sm" />
                          </div>
                          <div>
                             <label className="block text-[10px] font-bold text-gray-500 mb-1">Returned</label>
                             <input type="number" defaultValue="30" className="w-full border border-gray-300 rounded p-1.5 text-sm" />
                          </div>
                          <div>
                             <label className="block text-[10px] font-bold text-gray-500 mb-1">Revenue</label>
                             <input type="number" defaultValue="4000" className="w-full border border-gray-300 rounded p-1.5 text-sm" />
                          </div>
                          <div>
                             <label className="block text-[10px] font-bold text-gray-500 mb-1">POS Sold</label>
                             <input type="number" defaultValue="0" className="w-full border border-gray-300 rounded p-1.5 text-sm" />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           )}
           
           <div className="mt-8 pt-4 border-t flex justify-end gap-3 items-center">
              <span className="text-xs text-gray-500 mr-auto">Explicit publish required for authors to see past data.</span>
              <button onClick={() => setShowAuthorDataModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
              <button onClick={() => toast.success('Draft Saved!')} className="px-4 py-2 text-sm text-paa-navy border border-paa-navy rounded-lg font-medium hover:bg-paa-navy/5">Save Draft</button>
              <button onClick={() => { toast.success('Data Published! The author will now see these metrics in their dashboard.'); setShowAuthorDataModal(false); }} className="px-6 py-2 text-sm bg-paa-navy text-white rounded-lg font-bold hover:bg-paa-gold hover:text-paa-navy transition-colors shadow-md">Publish to Author</button>
           </div>
         </div>
      </Modal>
"""

lines.insert(123, state_vars + "\n")

btn_code = """            <button onClick={() => setShowAuthorDataModal(true)} className="dash-btn dash-btn-primary bg-indigo-600 hover:bg-indigo-700 text-white">
              <Edit className="w-4 h-4" /> Manage Author Data & Publish
            </button>\n"""

for i in range(len(lines)):
    if '<button onClick={() => setIsEventModalOpen(true)} className="dash-btn dash-btn-primary">' in lines[i]:
        lines.insert(i, btn_code)
        break

for i in range(len(lines)):
    if '<Modal isOpen={isEventModalOpen}' in lines[i]:
        lines.insert(i, modal_jsx + "\n")
        break

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Updated OperationsDashboardPage.tsx successfully")
