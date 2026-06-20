import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add useEffect to force open the modal
effect_code = """
  React.useEffect(() => {
     const pending = eventInvites?.find((inv: any) => inv.optInStatus === 'Opted-In' && inv.event.status === 'Past' && listedBooks.some((lb: any) => lb.eventId === inv.eventId && lb.listedStock !== (lb.soldStock || 0) + (lb.returnedStock || 0)));
     if (pending && !settleEventId) {
        handleOpenSettlement(pending.eventId);
     }
  }, [eventInvites, listedBooks]);
"""

if "const pending =" not in content:
    content = content.replace("  const handleOpenSettlement", effect_code + "\n  const handleOpenSettlement")

# 2. Hide Cancel button and X button if mandatory
old_close_btn = """<button onClick={() => setSettleEventId(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>"""
new_close_btn = """{eventInvites?.some((inv: any) => inv.eventId === settleEventId && inv.event.status === 'Past' && listedBooks.some((lb: any) => lb.eventId === settleEventId && lb.listedStock !== (lb.soldStock || 0) + (lb.returnedStock || 0))) ? null : <button onClick={() => setSettleEventId(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>}"""

if "inv.event.status === 'Past' && listedBooks.some" not in old_close_btn:
    content = content.replace(old_close_btn, new_close_btn)

old_cancel_btn = """<button type="button" onClick={() => setSettleEventId(null)} className="px-6 py-2 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-widest hover:bg-gray-200">Cancel</button>"""
new_cancel_btn = """{eventInvites?.some((inv: any) => inv.eventId === settleEventId && inv.event.status === 'Past' && listedBooks.some((lb: any) => lb.eventId === settleEventId && lb.listedStock !== (lb.soldStock || 0) + (lb.returnedStock || 0))) ? null : <button type="button" onClick={() => setSettleEventId(null)} className="px-6 py-2 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-widest hover:bg-gray-200">Cancel</button>}"""

if "inv.event.status === 'Past' && listedBooks.some" not in old_cancel_btn:
    content = content.replace(old_cancel_btn, new_cancel_btn)


# 3. Add blackout overlay right before the main dashboard div
blackout_overlay = """
      {/* Mandatory Settlement Overlay Blackout */}
      {eventInvites?.some((inv: any) => inv.optInStatus === 'Opted-In' && inv.event.status === 'Past' && listedBooks.some((lb: any) => lb.eventId === inv.eventId && lb.listedStock !== (lb.soldStock || 0) + (lb.returnedStock || 0))) && (
         <div className="fixed inset-0 bg-white z-[65] flex items-center justify-center pointer-events-auto">
            <div className="text-center">
               <Loader2 className="w-12 h-12 animate-spin text-paa-navy mx-auto mb-4" />
               <h2 className="text-2xl font-serif text-paa-navy">Action Required</h2>
               <p className="text-gray-500 mt-2">Please settle your past event inventory to access your dashboard.</p>
            </div>
         </div>
      )}
"""

main_div_str = '  return (\n    <div className="min-h-screen bg-paa-cream font-sans">'

if main_div_str in content and "Mandatory Settlement Overlay Blackout" not in content:
    content = content.replace(main_div_str, "  return (\n    <>\n" + blackout_overlay + "\n    <div className=\"min-h-screen bg-paa-cream font-sans\">")
    content = content.replace("  );\n}\n\nexport default AuthorDashboardPage;", "  </div>\n    </>\n  );\n}\n\nexport default AuthorDashboardPage;")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
