with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

import re

new_events_dashboard = '''function EventsDashboard() {
  const [invites, setInvites] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [listedBooks, setListedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [optInEventId, setOptInEventId] = useState<number | null>(null);
  const [selectedBooksToLink, setSelectedBooksToLink] = useState<{bookId: string, stock: string}[]>([]);

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
    } catch(err) {
       toast.error('Failed to load events');
    } finally {
       setLoading(false);
    }
  };

  const submitOptIn = async (eventId: number) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/events/${eventId}/opt-in`, {
        booksToLink: selectedBooksToLink
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success("Successfully opted in to Event!");
      setOptInEventId(null);
      fetchAuthorEvents();
    } catch (err) {
      toast.error('Opt-in failed');
    }
  };

  if (loading) return <div>Loading events...</div>;

  return (
    <div>
      <h1 className="text-4xl font-serif text-paa-navy mb-8 text-center uppercase">EVENTS ECOSYSTEM</h1>
      
      {invites.length === 0 ? (
         <div className="p-8 text-center text-gray-500 bg-white border border-gray-100 shadow-sm">
            You do not have any active event invitations right now.
         </div>
      ) : (
         <div className="grid md:grid-cols-2 gap-6">
            {invites.map((invite) => {
               const evt = invite.event;
               const isOptedIn = invite.optInStatus === 'Opted-In';
               const myBooksForEvent = listedBooks.filter(lb => lb.eventId === evt.id);
               
               return (
                 <div key={invite.id} className={`bg-white border shadow-sm relative overflow-hidden ${isOptedIn ? 'border-green-300' : 'border-paa-navy/20'}`}>
                    <div className={`px-4 py-2 text-white font-bold text-xs uppercase tracking-widest flex justify-between items-center ${isOptedIn ? 'bg-green-600' : 'bg-blue-600'}`}>
                       <span>{evt.status}</span>
                       <span>{isOptedIn ? 'Opted In' : 'Action Required'}</span>
                    </div>
                    <div className="p-6">
                       <h4 className="text-xl font-serif font-medium text-paa-navy mb-3">{evt.name}</h4>
                       <p className="text-sm font-medium text-gray-600 mb-1">📅 {evt.date} &bull; {evt.duration}</p>
                       <p className="text-sm font-medium text-gray-600 mb-6">📍 {evt.location}</p>
                       
                       {isOptedIn ? (
                          <div className="bg-green-50 p-4 border border-green-200">
                             <p className="text-xs font-bold uppercase tracking-widest text-green-800 mb-2 border-b border-green-200 pb-1">Your Listed Inventory</p>
                             <ul className="space-y-1">
                               {myBooksForEvent.map(mb => {
                                  const bDetails = books.find(b => b.id === mb.bookId);
                                  return (
                                     <li key={mb.id} className="text-sm flex justify-between text-green-900">
                                        <span>{bDetails?.title || 'Unknown Book'}</span>
                                        <span className="font-bold">{mb.listedStock} units</span>
                                     </li>
                                  )
                               })}
                             </ul>
                          </div>
                       ) : (
                          <div className="pt-4 border-t border-gray-100">
                             {optInEventId === evt.id ? (
                               <div className="space-y-4">
                                  <p className="text-xs font-bold uppercase text-paa-navy mb-2">Select Books to List:</p>
                                  {books.map(b => {
                                     const isSelected = selectedBooksToLink.find(sb => sb.bookId === String(b.id));
                                     return (
                                        <div key={b.id} className="flex items-center gap-3 bg-gray-50 p-2 border border-gray-200">
                                           <input type="checkbox" checked={!!isSelected} onChange={(e) => {
                                              if (e.target.checked) setSelectedBooksToLink([...selectedBooksToLink, {bookId: String(b.id), stock: '5'}])
                                              else setSelectedBooksToLink(selectedBooksToLink.filter(sb => sb.bookId !== String(b.id)))
                                           }} />
                                           <span className="text-sm flex-1">{b.title}</span>
                                           {isSelected && (
                                              <input type="number" min="1" className="w-20 p-1 text-sm border outline-none" value={isSelected.stock} onChange={(e) => {
                                                 setSelectedBooksToLink(selectedBooksToLink.map(sb => sb.bookId === String(b.id) ? {...sb, stock: e.target.value} : sb))
                                              }} placeholder="Qty" />
                                           )}
                                        </div>
                                     );
                                  })}
                                  <div className="flex gap-2 pt-2">
                                     <button onClick={() => setOptInEventId(null)} className="flex-1 py-2 bg-gray-200 text-gray-700 text-xs font-bold uppercase transition-colors">Cancel</button>
                                     <button onClick={() => submitOptIn(evt.id)} className="flex-1 py-2 bg-paa-navy hover:bg-paa-navy/90 text-white text-xs font-bold uppercase transition-colors">Confirm</button>
                                  </div>
                               </div>
                             ) : (
                               <button onClick={() => { setOptInEventId(evt.id); setSelectedBooksToLink([]); }} className="w-full py-2 bg-paa-navy hover:bg-paa-navy/90 text-white text-xs font-bold uppercase tracking-widest transition-colors">
                                  Opt-In & List Books
                               </button>
                             )}
                          </div>
                       )}
                    </div>
                 </div>
               )
            })}
         </div>
      )}
    </div>
  );
}'''

content = re.sub(r'function EventsDashboard\(\{ registrations \}: \{ registrations: any\[\] \}\) \{[\s\S]*?    </div>\n  \);\n\}', new_events_dashboard, content)

with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AuthorDashboardPage.tsx")
