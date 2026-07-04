import os
import re

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find EventsDashboard function
events_dash_idx = -1
for i, line in enumerate(lines):
    if "function EventsDashboard({ registrations }: any) {" in line:
        events_dash_idx = i
        break

state_lines = """  const [isOptInModalOpen, setIsOptInModalOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<any>(null);
  const [optInBooks, setOptInBooks] = useState<any[]>([]);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);

  const handleOpenOptIn = (evt: any) => {
     setSelectedInvite(evt);
     // Initialize all books as included with default stock 10
     setOptInBooks(books.map((b: any) => ({ bookId: b.id.toString(), title: b.title, stock: 10, included: true })));
     setPaymentScreenshot(null);
     setIsOptInModalOpen(true);
  };

  const handleOptInSubmit = async (action: 'approve' | 'reject') => {
     try {
        if (action === 'approve') {
            const fd = new FormData();
            const includedBooks = optInBooks.filter(b => b.included);
            fd.append('booksToLink', JSON.stringify(includedBooks));
            if (paymentScreenshot) {
                fd.append('paymentScreenshot', paymentScreenshot);
            }
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/events/${selectedInvite.id}/opt-in`, fd, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Successfully opted into event!');
        } else {
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/events/${selectedInvite.id}/opt-out`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Event invite declined.');
        }
        setIsOptInModalOpen(false);
        fetchAuthorEvents(); // refresh
     } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to process event invite');
     }
  };
"""

if events_dash_idx != -1:
    lines.insert(events_dash_idx + 1, state_lines)

# Find the Registration column in the table to add the button
registration_span_idx = -1
for i, line in enumerate(lines):
    if "{evt.registration}" in line and "</span>" in lines[i+1]:
        registration_span_idx = i + 1
        break

if registration_span_idx != -1:
    lines.insert(registration_span_idx + 1, """
                      {evt.isInvite && evt.registration === 'Pending' && (
                          <button onClick={() => handleOpenOptIn(evt)} className="ml-3 text-xs bg-paa-navy text-paa-cream px-3 py-1 rounded-full font-bold shadow hover:bg-paa-navy/90">Review Invite</button>
                      )}
""")

# Find the end of EventsDashboard to add the Modal
end_of_events_dash = -1
depth = 0
for i in range(events_dash_idx, len(lines)):
    if "{" in lines[i]: depth += lines[i].count("{")
    if "}" in lines[i]: depth -= lines[i].count("}")
    if depth == 0 and "}" in lines[i]:
        end_of_events_dash = i
        break

modal_ui = """
      <Modal isOpen={isOptInModalOpen} onClose={() => setIsOptInModalOpen(false)} title={`Review Invite: ${selectedInvite?.name}`}>
         {selectedInvite && (
             <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                   <h3 className="font-bold text-blue-900 mb-1">Event Invitation</h3>
                   <p className="text-sm text-blue-800">You have been invited to participate in this event. Please select the books you want to bring.</p>
                   {selectedInvite.registrationFee > 0 && (
                       <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 font-medium">
                           Registration Fee: ₹{selectedInvite.registrationFee}
                           <div className="mt-2">
                               <label className="block text-xs font-bold mb-1">Upload Payment Screenshot</label>
                               <input type="file" accept="image/*" onChange={(e) => setPaymentScreenshot(e.target.files?.[0] || null)} className="text-xs" />
                           </div>
                       </div>
                   )}
                </div>
                
                <div>
                   <h4 className="font-bold text-gray-800 mb-3 border-b pb-2">Select Books for Event</h4>
                   <div className="space-y-3 max-h-64 overflow-y-auto">
                       {optInBooks.map((b, idx) => (
                           <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${b.included ? 'border-paa-navy bg-paa-navy/5' : 'border-gray-200 bg-gray-50'}`}>
                               <div className="flex items-center gap-3">
                                   <button 
                                      onClick={() => {
                                          const newBooks = [...optInBooks];
                                          newBooks[idx].included = !newBooks[idx].included;
                                          setOptInBooks(newBooks);
                                      }}
                                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${b.included ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                                   >
                                      {b.included ? '-' : '+'}
                                   </button>
                                   <div>
                                      <div className={`font-semibold ${b.included ? 'text-paa-navy' : 'text-gray-400 line-through'}`}>{b.title}</div>
                                      {b.included && <div className="text-xs text-gray-500">Status: Selected</div>}
                                   </div>
                               </div>
                               {b.included && (
                                   <div className="flex flex-col items-end">
                                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Stock</label>
                                      <input 
                                         type="number" 
                                         min="1"
                                         value={b.stock} 
                                         onChange={(e) => {
                                             const newBooks = [...optInBooks];
                                             newBooks[idx].stock = parseInt(e.target.value) || 0;
                                             setOptInBooks(newBooks);
                                         }} 
                                         className="w-20 border border-gray-300 rounded p-1 text-center font-mono text-sm"
                                      />
                                   </div>
                               )}
                           </div>
                       ))}
                       {optInBooks.length === 0 && <p className="text-sm text-gray-500 italic">No approved books found in your catalog.</p>}
                   </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button onClick={() => handleOptInSubmit('reject')} className="px-6 py-2 rounded-lg font-bold text-red-700 bg-red-50 hover:bg-red-100 transition-colors border border-red-200">Decline Invite</button>
                    <button onClick={() => handleOptInSubmit('approve')} className="px-6 py-2 rounded-lg font-bold text-white bg-paa-navy hover:brightness-110 transition-all shadow-md">Accept & Register</button>
                </div>
             </div>
         )}
      </Modal>
"""

if end_of_events_dash != -1:
    lines.insert(end_of_events_dash, modal_ui)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Added OptIn Modal to EventsDashboard!")
