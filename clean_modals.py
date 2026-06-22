import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# We want to remove all occurrences of the settlement modal EXCEPT the one in EventsDashboard.
# Wait, the simplest way is to remove ALL of them, and then carefully insert ONE back into EventsDashboard!

settle_modal_regex = r"      \{\/\* Settlement Modal \*\/\}[\s\S]*?            <\/form>\n          <\/div>\n        <\/div>\n      \)\}"

# Remove ALL occurrences
content = re.sub(settle_modal_regex, "", content)
content = content.replace("  return (\n    <div>\n\n\n  return (\n    <div>", "  return (\n    <div>")
# Clean up any leftover duplicated returns if they occurred
content = re.sub(r"  return \(\n    <div>\s*\n\s*return \(\n    <div>", "  return (\n    <div>", content)

# Now, cleanly insert ONE modal into EventsDashboard!
# Where does EventsDashboard return?
# Let's find "function EventsDashboard() {" and then find the first "return (" inside it.
events_dash_idx = content.find("function EventsDashboard() {")
if events_dash_idx != -1:
    return_idx = content.find("  return (\n    <div>", events_dash_idx)
    if return_idx != -1:
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
        content = content[:return_idx] + "  return (\n    <div>\n" + settle_modal + content[return_idx + len("  return (\n    <div>"):]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
