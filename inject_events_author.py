import os
import re

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to rewrite the EventsDashboard function.
# Let's find the start of EventsDashboard and the end of it.
start_idx = content.find("function EventsDashboard({ registrations }: any) {")
if start_idx == -1:
    print("Could not find EventsDashboard")
    exit()
    
# Find the end of the function by counting braces
open_braces = 0
end_idx = -1
in_function = False

for i in range(start_idx, len(content)):
    if content[i] == '{':
        open_braces += 1
        in_function = True
    elif content[i] == '}':
        open_braces -= 1
    
    if in_function and open_braces == 0:
        end_idx = i
        break

if end_idx == -1:
    print("Could not find end of EventsDashboard")
    exit()

# We will just replace it entirely with our new 3-tab layout.
# We will use python to generate the replacement string.

new_events_dashboard = """
function EventsDashboard({ registrations }: any) {
  const [activeTab, setActiveTab] = useState('events');
  const [invites, setInvites] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [listedBooks, setListedBooks] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tab 2 State
  const [selectedEventId, setSelectedEventId] = useState<string>('ALL');
  
  // Tab 3 State
  const [t3EventFilter, setT3EventFilter] = useState('ALL');
  const [t3YearFilter, setT3YearFilter] = useState('ALL');
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  
  useEffect(() => {
    fetchAuthorEvents();
  }, []);

  const fetchAuthorEvents = async () => {
    try {
       const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/events`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
       });
       setInvites(res.data.eventInvites || []);
       setBooks(res.data.books || []);
       setListedBooks(res.data.listedBooks || []);
       setPastEvents(res.data.pastEvents || []);
       if (res.data.books && res.data.books.length > 0) {
           setSelectedBookIds(res.data.books.map((b: any) => b.id.toString()));
       }
    } catch(err) {
       toast.error('Failed to load events');
    } finally {
       setLoading(false);
    }
  };

  // Combine invites and past events for the events list
  const allEvents = [
     ...invites.map((inv: any) => ({
         ...inv.event,
         registration: inv.optInStatus,
         paymentStatus: inv.paymentStatus,
         isInvite: true
     })),
     ...pastEvents.map((pe: any) => ({
         ...pe.event,
         registration: 'Participated',
         paymentStatus: '-',
         isPast: true,
         isDataUpdated: pe.isDataUpdated,
         books: pe.books || []
     }))
  ];
  
  const getEventBooks = (eventId: number) => listedBooks.filter((lb: any) => lb.eventId === eventId);
  const getPastEventBooks = (eventId: number) => {
     const pe = pastEvents.find(p => p.eventId === eventId);
     return pe?.books || [];
  };

  if (loading) return <div className="p-8 text-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />Loading events...</div>;

  return (
    <div className="bg-white rounded-xl">
      <div className="flex border-b border-gray-200 mb-6">
         <button onClick={() => setActiveTab('events')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'events' ? 'border-paa-navy text-paa-navy' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Events Overview</button>
         <button onClick={() => setActiveTab('details')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-paa-navy text-paa-navy' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Event Details</button>
         <button onClick={() => setActiveTab('performance')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'performance' ? 'border-paa-navy text-paa-navy' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Book Performance</button>
      </div>

      {activeTab === 'events' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold rounded-tl-lg">Event</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Location</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold text-right">Books Sold</th>
                <th className="p-4 font-semibold text-right">Revenue</th>
                <th className="p-4 font-semibold rounded-tr-lg">Registration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allEvents.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-500">No events found.</td></tr>}
              {allEvents.map((evt: any, i: number) => {
                 let sold = 0;
                 let rev = 0;
                 if (evt.isPast && evt.isDataUpdated) {
                     evt.books.forEach((b: any) => {
                         sold += (b.soldStock || 0);
                         rev += (b.revenue || 0);
                     });
                 } else if (evt.isInvite) {
                     const evtBooks = getEventBooks(evt.id);
                     evtBooks.forEach((b: any) => {
                         sold += (b.soldStock || 0);
                         rev += (b.revenue || 0);
                     });
                 }
                 
                 return (
                 <tr key={i} className="hover:bg-gray-50/50">
                   <td className="p-4">
                     <div className="font-semibold text-gray-900">{evt.name}</div>
                   </td>
                   <td className="p-4 text-sm text-gray-600">{new Date(evt.startDate || evt.date).toLocaleDateString()}</td>
                   <td className="p-4 text-sm text-gray-600">{evt.location || evt.venue || 'TBA'}</td>
                   <td className="p-4 text-sm text-gray-600">{evt.type || (evt.isPast ? 'Past Event' : 'Upcoming/Live')}</td>
                   <td className="p-4 text-sm font-mono text-right">{evt.isPast && !evt.isDataUpdated ? '-' : sold}</td>
                   <td className="p-4 text-sm font-mono text-right">{evt.isPast && !evt.isDataUpdated ? '-' : `₹${rev}`}</td>
                   <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${evt.registration === 'Opted-In' || evt.registration === 'Participated' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'}`}>
                         {evt.registration}
                      </span>
                   </td>
                 </tr>
                 );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'details' && (
        <div>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center gap-4">
             <label className="text-sm font-semibold text-gray-700">Select Event:</label>
             <select 
                value={selectedEventId} 
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-paa-navy"
             >
                <option value="ALL">-- Select an Event --</option>
                {allEvents.map((evt: any, i: number) => (
                    <option key={i} value={evt.id}>{evt.name} {evt.isPast && !evt.isDataUpdated ? '(Pending Publish)' : ''}</option>
                ))}
             </select>
          </div>
          
          {selectedEventId !== 'ALL' && (() => {
             const evt = allEvents.find((e: any) => e.id.toString() === selectedEventId);
             if (!evt) return null;
             
             const isPastPending = evt.isPast && !evt.isDataUpdated;
             
             let displayBooks = [];
             if (evt.isPast) {
                 displayBooks = evt.books || [];
             } else {
                 displayBooks = getEventBooks(evt.id).map(lb => ({
                     bookId: lb.bookId,
                     title: lb.book.title,
                     listedStock: lb.listedStock,
                     soldStock: lb.soldStock,
                     returnedStock: lb.returnedStock,
                     revenue: lb.revenue,
                     posSold: 0,
                     manualSold: lb.soldStock
                 }));
             }

             return (
               <div className="space-y-6">
                  <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                     <h2 className="text-xl font-bold text-gray-900 mb-2">{evt.name}</h2>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                           <div className="text-xs text-gray-500 uppercase font-semibold">Date</div>
                           <div className="text-sm font-medium">{new Date(evt.startDate || evt.date).toLocaleDateString()}</div>
                        </div>
                        <div>
                           <div className="text-xs text-gray-500 uppercase font-semibold">Location</div>
                           <div className="text-sm font-medium">{evt.location || evt.venue || 'TBA'}</div>
                        </div>
                        <div>
                           <div className="text-xs text-gray-500 uppercase font-semibold">Type</div>
                           <div className="text-sm font-medium">{evt.type || (evt.isPast ? 'Past Event' : 'Live Event')}</div>
                        </div>
                        <div>
                           <div className="text-xs text-gray-500 uppercase font-semibold">Status</div>
                           <div className="text-sm font-medium">{evt.status || (evt.isPast ? 'Completed' : 'Active')}</div>
                        </div>
                     </div>
                  </div>
                  
                  {isPastPending ? (
                     <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">Data Pending</h3>
                        <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">The sales data for this past event has not been published by the admin yet. Please check back later.</p>
                     </div>
                  ) : (
                     <div className="overflow-x-auto border border-gray-200 rounded-xl">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                 <th className="p-4 font-semibold">Book Title</th>
                                 <th className="p-4 font-semibold text-right">Sent</th>
                                 <th className="p-4 font-semibold text-right">Sold</th>
                                 <th className="p-4 font-semibold text-right">Returned</th>
                                 <th className="p-4 font-semibold text-right">Revenue</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-100">
                              {displayBooks.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">No books listed for this event.</td></tr>}
                              {displayBooks.map((b: any, i: number) => (
                                 <tr key={i} className="hover:bg-gray-50/50">
                                    <td className="p-4 font-medium text-gray-900">{b.title || books.find((ab:any) => ab.id === b.bookId)?.title || 'Unknown Book'}</td>
                                    <td className="p-4 text-sm font-mono text-right">{b.listedStock || b.sent || 0}</td>
                                    <td className="p-4 text-sm font-mono text-right">{b.soldStock || b.sold || 0}</td>
                                    <td className="p-4 text-sm font-mono text-right">{b.returnedStock || b.returned || 0}</td>
                                    <td className="p-4 text-sm font-mono text-right text-emerald-600 font-medium">₹{b.revenue || 0}</td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  )}
               </div>
             );
          })()}
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
           <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="mb-4">
                 <label className="text-sm font-semibold text-gray-700 block mb-2">Select Books to Analyze:</label>
                 <div className="flex flex-wrap gap-4">
                    {books.map((b: any) => (
                       <label key={b.id} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input 
                             type="checkbox" 
                             checked={selectedBookIds.includes(b.id.toString())}
                             onChange={(e) => {
                                if (e.target.checked) setSelectedBookIds([...selectedBookIds, b.id.toString()]);
                                else setSelectedBookIds(selectedBookIds.filter(id => id !== b.id.toString()));
                             }}
                             className="text-paa-navy focus:ring-paa-navy rounded"
                          />
                          {b.title}
                       </label>
                    ))}
                 </div>
              </div>
           </div>
           
           <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                       <th className="p-4 font-semibold">Event</th>
                       <th className="p-4 font-semibold text-right">Copies Sent</th>
                       <th className="p-4 font-semibold text-right">Copies Sold</th>
                       <th className="p-4 font-semibold text-right">Revenue</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {allEvents.filter((evt: any) => evt.isDataUpdated || !evt.isPast).map((evt: any, i: number) => {
                       let sent = 0;
                       let sold = 0;
                       let rev = 0;
                       
                       let evtBooks = [];
                       if (evt.isPast) evtBooks = evt.books || [];
                       else evtBooks = getEventBooks(evt.id);
                       
                       evtBooks.forEach((b: any) => {
                           if (selectedBookIds.includes(b.bookId?.toString() || b.id?.toString())) {
                               sent += (b.listedStock || b.sent || 0);
                               sold += (b.soldStock || b.sold || 0);
                               rev += (b.revenue || 0);
                           }
                       });
                       
                       if (sent === 0 && sold === 0 && rev === 0) return null;
                       
                       return (
                          <tr key={i} className="hover:bg-gray-50/50">
                             <td className="p-4 font-medium text-gray-900">{evt.name}</td>
                             <td className="p-4 text-sm font-mono text-right">{sent}</td>
                             <td className="p-4 text-sm font-mono text-right">{sold}</td>
                             <td className="p-4 text-sm font-mono text-right text-emerald-600 font-medium">₹{rev}</td>
                          </tr>
                       );
                    })}
                 </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
}
"""

content = content[:start_idx] + new_events_dashboard.strip() + content[end_idx+1:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AuthorDashboardPage.tsx with 3-tab layout")
