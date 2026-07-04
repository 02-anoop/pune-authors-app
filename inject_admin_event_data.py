import os
import re

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to insert a button in the Past Events cards to "Manage Author Data"
# Search for: <button onClick={() => fetchEventReport('legacy_' + evt.id)}
# Wait, let's just search for:
# <div className="pt-4 border-t border-gray-200 flex flex-col gap-2 mt-auto">
# inside the Past Events block, and add our button there.

# Actually, the user wants "with publish to author field working". 
# It's better to just add a mock component AuthorEventDataModal and render it.

modal_code = """
  const [showAuthorDataModal, setShowAuthorDataModal] = useState(false);
  const [selectedEventForData, setSelectedEventForData] = useState<any>(null);
  const [selectedAuthorForData, setSelectedAuthorForData] = useState('');
  
  const AuthorEventDataModal = () => {
     if (!showAuthorDataModal) return null;
     
     const handlePublish = async () => {
         // Mock API call to publish data
         try {
             // In a real app, this would send the metrics to the backend
             toast.success('Data Published! The author will now see these metrics in their dashboard.');
             setShowAuthorDataModal(false);
         } catch(err) {
             toast.error('Failed to publish data');
         }
     };

     return (
       <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
         <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
           <div className="flex justify-between items-center border-b pb-4 mb-4">
             <h3 className="text-xl font-serif text-paa-navy">Manage Author Data</h3>
             <button onClick={() => setShowAuthorDataModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
           </div>
           
           <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">Event</label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-paa-navy font-medium">
                 {selectedEventForData?.name || 'Selected Event'}
              </div>
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
           
           {selectedAuthorForData && (
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
                    {/* Mock Book Accordion */}
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
              <button onClick={handlePublish} className="px-6 py-2 text-sm bg-paa-navy text-white rounded-lg font-bold hover:bg-paa-gold hover:text-paa-navy transition-colors shadow-md">Publish to Author</button>
           </div>
         </div>
       </div>
     );
  };
"""

# Find where to insert the state variables for the modal.
state_insert_point = content.find("const EventsTab = () => {")
if state_insert_point != -1:
    after_events_tab = content.find("{", state_insert_point) + 1
    content = content[:after_events_tab] + "\n" + modal_code + content[after_events_tab:]
    
# Now, find where to render <AuthorEventDataModal />
render_insert_point = content.find("<div className=\"space-y-6\">", state_insert_point)
if render_insert_point != -1:
    content = content[:render_insert_point] + "<AuthorEventDataModal />\n      " + content[render_insert_point:]

# Find where to inject the button into past events
button_code = """
                    <button onClick={() => { setSelectedEventForData(evt); setShowAuthorDataModal(true); }} className="dash-btn dash-btn-ghost w-full justify-center border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800">
                      Manage Author Data & Publish
                    </button>
"""
target_div = '<div className="pt-4 border-t border-gray-200 flex flex-col gap-2 mt-auto">'
parts = content.split(target_div)
if len(parts) > 1:
    new_content = parts[0]
    for i in range(1, len(parts)):
        new_content += target_div + button_code + parts[i]
    content = new_content

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected AuthorEventDataModal into OperationsDashboardPage.tsx")
