import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add state for Settlement Modal
if "const [settleEventId, setSettleEventId] = useState" not in content:
    content = content.replace(
        "const [optInEventId, setOptInEventId] = useState<number | null>(null);",
        "const [optInEventId, setOptInEventId] = useState<number | null>(null);\n  const [settleEventId, setSettleEventId] = useState<number | null>(null);\n  const [settlementData, setSettlementData] = useState<any[]>([]);"
    )

# 2. Add handleOpenSettlement and handleSubmitSettlement
settle_code = """
  const handleOpenSettlement = (eventId: number) => {
     const relevantBooks = listedBooks.filter((lb: any) => lb.eventId === eventId);
     setSettlementData(relevantBooks.map((lb: any) => ({
        eventBookId: lb.id,
        bookId: lb.bookId,
        listedStock: lb.listedStock,
        soldStock: lb.soldStock || 0,
        returnedStock: lb.returnedStock || 0,
        isSettled: lb.listedStock === (lb.soldStock || 0) + (lb.returnedStock || 0)
     })));
     setSettleEventId(eventId);
  };

  const handleSubmitSettlement = async (e: React.FormEvent) => {
     e.preventDefault();
     try {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/author/events/${settleEventId}/settle`, {
           settlements: settlementData
        }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
        toast.success("Inventory settled successfully! Remaining stock added back to your inventory.");
        setSettleEventId(null);
        fetchAuthorEvents(); // Reload to reflect settled status
     } catch (err) {
        toast.error("Failed to submit settlement");
     }
  };

  useEffect(() => {
     const pending = invites.find((inv: any) => inv.optInStatus === 'Opted-In' && inv.event.status === 'Past' && listedBooks.some((lb: any) => lb.eventId === inv.eventId && lb.listedStock !== (lb.soldStock || 0) + (lb.returnedStock || 0)));
     if (pending && !settleEventId) {
        handleOpenSettlement(pending.eventId);
     }
  }, [invites, listedBooks]);
"""
if "handleOpenSettlement" not in content:
    content = content.replace("  const submitOptIn", settle_code + "\n  const submitOptIn")


# 3. Add Settlement Modal JSX
settle_modal = """
      {/* Settlement Modal */}
      {settleEventId && (
        <div className="fixed inset-0 bg-paa-navy/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-paa-navy/10 flex justify-between items-center bg-[#f8fafc]">
               <div>
                 <h2 className="text-xl font-serif text-paa-navy">Settle Event Inventory</h2>
                 <p className="text-xs text-gray-500 mt-1">Please enter the exact number of books sold and returned. (Sold + Returned must equal Listed)</p>
               </div>
               {invites.some((inv: any) => inv.eventId === settleEventId && inv.event.status === 'Past' && listedBooks.some((lb: any) => lb.eventId === settleEventId && lb.listedStock !== (lb.soldStock || 0) + (lb.returnedStock || 0))) ? null : (
                  <button onClick={() => setSettleEventId(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
               )}
            </div>
            <form onSubmit={handleSubmitSettlement} className="p-6 overflow-y-auto">
               <div className="space-y-4">
                  {settlementData.map((sd, idx) => {
                     const bookName = books.find((b: any) => b.id === sd.bookId)?.title || "Unknown Book";
                     return (
                        <div key={sd.eventBookId} className="p-4 border border-paa-navy/10 rounded bg-gray-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                           <div className="flex-1">
                              <h4 className="font-bold text-paa-navy text-sm">{bookName}</h4>
                              <p className="text-xs text-gray-500 mt-1 font-bold tracking-widest uppercase">Listed: {sd.listedStock}</p>
                           </div>
                           {sd.isSettled ? (
                              <div className="text-sm font-bold text-green-700 bg-green-50 px-4 py-2 border border-green-200">Already Settled</div>
                           ) : (
                              <div className="flex gap-4">
                                 <div className="w-24">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Sold</label>
                                    <input type="number" required min="0" max={sd.listedStock} value={sd.soldStock} onChange={e => {
                                       const sold = parseInt(e.target.value) || 0;
                                       if (sold > sd.listedStock) return;
                                       const newSd = [...settlementData];
                                       newSd[idx].soldStock = sold;
                                       newSd[idx].returnedStock = newSd[idx].listedStock - sold;
                                       setSettlementData(newSd);
                                    }} className="w-full p-2 text-sm border border-paa-navy/20 focus:border-paa-navy outline-none" />
                                 </div>
                                 <div className="w-24">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Returned</label>
                                    <input type="number" required min="0" max={sd.listedStock} value={sd.returnedStock} readOnly className="w-full p-2 text-sm border border-paa-navy/20 outline-none bg-gray-100 text-gray-500" />
                                 </div>
                              </div>
                           )}
                        </div>
                     )
                  })}
               </div>
               <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-paa-navy/10">
                  {invites.some((inv: any) => inv.eventId === settleEventId && inv.event.status === 'Past' && listedBooks.some((lb: any) => lb.eventId === settleEventId && lb.listedStock !== (lb.soldStock || 0) + (lb.returnedStock || 0))) ? null : (
                     <button type="button" onClick={() => setSettleEventId(null)} className="px-6 py-2 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-widest hover:bg-gray-200">Cancel</button>
                  )}
                  <button type="submit" disabled={settlementData.every(s => s.isSettled) || settlementData.some(s => s.listedStock !== s.soldStock + s.returnedStock)} className="px-6 py-2 bg-paa-navy text-paa-cream text-xs font-bold uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy disabled:opacity-50">Submit Settlement</button>
               </div>
            </form>
          </div>
        </div>
      )}
"""
if "Settle Event Inventory" not in content:
    content = content.replace("  return (\n    <div>", settle_modal + "\n  return (\n    <div>")


# 4. Add Settle Inventory button
old_is_opted_in_block = """                           <div className="bg-green-50 p-4 border border-green-200">
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
                           </div>"""

new_is_opted_in_block = """                           <div className="bg-green-50 p-4 border border-green-200">
                              <p className="text-xs font-bold uppercase tracking-widest text-green-800 mb-2 border-b border-green-200 pb-1">Your Listed Inventory</p>
                              <ul className="space-y-1">
                                {myBooksForEvent.map((mb: any) => {
                                   const bDetails = books.find((b: any) => b.id === mb.bookId);
                                   return (
                                      <li key={mb.id} className="text-sm flex justify-between text-green-900">
                                         <span>{bDetails?.title || 'Unknown Book'}</span>
                                         <span className="font-bold">{mb.listedStock} units</span>
                                      </li>
                                   )
                                })}
                              </ul>
                              {evt.status === 'Past' && (
                                 <button onClick={() => handleOpenSettlement(evt.id)} className="w-full mt-4 py-2 bg-paa-navy text-paa-cream font-bold text-xs uppercase tracking-widest hover:bg-paa-gold hover:text-paa-navy transition-colors shadow">Settle Inventory</button>
                              )}
                           </div>"""

if "Settle Inventory" not in content:
    content = content.replace(old_is_opted_in_block, new_is_opted_in_block)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
