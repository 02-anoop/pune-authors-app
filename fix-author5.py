import sys
import re

def fix_author_dashboard():
    with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix 1: Calculate amountPaid in invites.map
    target1 = """    ...invites.map((inv: any) => {
      const hasGranular = listedBooks.some((lb: any) => lb.eventId === (inv.eventId || inv.event?.id) && (lb.soldStock > 0 || lb.returnedStock > 0));
      return {
        ...inv.event,"""
    
    replace1 = """    ...invites.map((inv: any) => {
      const eventBooks = listedBooks.filter((lb: any) => lb.eventId === (inv.eventId || inv.event?.id));
      const hasGranular = eventBooks.some((lb: any) => (lb.soldStock > 0 || lb.returnedStock > 0));
      let calcPaid = 0;
      if (inv.optInStatus === 'Registered' || inv.optInStatus === 'Approved' || inv.optInStatus === 'Pending Approval') {
         if (inv.event?.feeType === 'Per Title') {
             calcPaid = (inv.event?.registrationFee || 0) * eventBooks.length;
         } else {
             calcPaid = (inv.event?.registrationFee || 0);
         }
      }
      return {
        ...inv.event,
        amountPaid: calcPaid,"""
    content = content.replace(target1, replace1)

    # Fix 2: Add TrendingUp to lucide-react imports if it's missing
    if "TrendingUp" not in content:
        content = content.replace("from 'lucide-react';", ", TrendingUp } from 'lucide-react';").replace("} , TrendingUp", ", TrendingUp }")

    # Fix 3: KPI Cards breakdown and Net Gain/Loss
    target3_regex = re.compile(r'<div className="grid grid-cols-2 md:grid-cols-4 gap-6">.*?</div>\s*</div>\s*</div>', re.DOTALL)
    
    replace3 = """<div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col justify-center">
              <div className="text-[10px] font-bold text-paa-gray-text uppercase tracking-widest mb-2 flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-indigo-500" /> Total Events</div>
              <div className="text-3xl font-serif font-bold text-paa-navy">{validParticipations.length}</div>
              <div className="text-xs text-gray-500 mt-2 font-mono font-medium">Fairs: {validParticipations.filter((evt: any) => (evt.type || evt.eventType) === 'Book Fair').length} • Events: {validParticipations.filter((evt: any) => (evt.type || evt.eventType) !== 'Book Fair').length}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col justify-center">
              <div className="text-[10px] font-bold text-paa-gray-text uppercase tracking-widest mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4 text-emerald-500" /> Total Books Sold</div>
             <div className="text-3xl font-serif font-bold text-emerald-700">
                 {validParticipations.reduce((acc: number, evt: any) => {
                    let sold = 0;
                    if (evt.manualTotalSold !== null && evt.manualTotalSold !== undefined) {
                       sold = evt.manualTotalSold;
                    } else if (evt.isPast && evt.isDataUpdated) {
                       evt.books?.forEach((b: any) => sold += (b.soldStock || 0));
                    } else if (evt.isInvite) {
                       getEventBooks(evt.id).forEach((b: any) => sold += (b.soldStock || 0));
                    }
                    return acc + sold;
                 }, 0)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col justify-center">
              <div className="text-[10px] font-bold text-paa-gray-text uppercase tracking-widest mb-2 flex items-center gap-2"><DollarSign className="w-4 h-4 text-blue-500" /> Total Revenue</div>
              <div className="text-3xl font-serif font-bold text-blue-700">
                 ₹{validParticipations.reduce((acc: number, evt: any) => {
                    let rev = 0;
                    if (evt.manualTotalRevenue !== null && evt.manualTotalRevenue !== undefined) {
                       rev = evt.manualTotalRevenue;
                    } else if (evt.isPast && evt.isDataUpdated) {
                       evt.books?.forEach((b: any) => rev += (b.soldStock || 0) * (b.mrp || b.book?.mrp || 0));
                    } else if (evt.isInvite) {
                       getEventBooks(evt.id).forEach((b: any) => rev += (b.soldStock || 0) * (b.mrp || b.book?.mrp || 0));
                    }
                    return acc + rev;
                 }, 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col justify-center cursor-pointer hover:border-orange-200 transition-all group" onClick={() => setActiveTab('payments')}>
              <div className="text-[10px] font-bold text-paa-gray-text uppercase tracking-widest mb-2 flex items-center gap-2 group-hover:text-orange-500 transition-colors"><CheckCircle2 className="w-4 h-4 text-orange-500" /> Total Payments Done</div>
              <div className="text-3xl font-serif font-bold text-orange-700">₹{validParticipations.reduce((sum: number, evt: any) => sum + (evt.amountPaid || 0), 0).toLocaleString()}</div>
              <div className="text-[10px] text-orange-400 mt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Click to view details &rarr;</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-paa-navy/5 shadow-premium flex flex-col justify-center">
              <div className="text-[10px] font-bold text-paa-gray-text uppercase tracking-widest mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-indigo-500" /> Net Gain/Loss</div>
              <div className="text-3xl font-serif font-bold text-indigo-700">
                 {(() => {
                    const totalRev = validParticipations.reduce((acc: number, evt: any) => {
                       let rev = 0;
                       if (evt.manualTotalRevenue !== null && evt.manualTotalRevenue !== undefined) {
                          rev = evt.manualTotalRevenue;
                       } else if (evt.isPast && evt.isDataUpdated) {
                          evt.books?.forEach((b: any) => rev += (b.soldStock || 0) * (b.mrp || b.book?.mrp || 0));
                       } else if (evt.isInvite) {
                          getEventBooks(evt.id).forEach((b: any) => rev += (b.soldStock || 0) * (b.mrp || b.book?.mrp || 0));
                       }
                       return acc + rev;
                    }, 0);
                    const totalPaid = validParticipations.reduce((sum: number, evt: any) => sum + (evt.amountPaid || 0), 0);
                    const net = totalRev - totalPaid;
                    return <span className={net >= 0 ? "text-emerald-700" : "text-red-600"}>{net >= 0 ? '+' : '-'}₹{Math.abs(net).toLocaleString()}</span>;
                 })()}
              </div>
            </div>
          </div>
        </div>"""
    
    match = target3_regex.search(content)
    if match:
        content = content[:match.start()] + replace3 + content[match.end():]

    # Fix 4: Gain/Loss in Dropdown
    target4 = """                                         <div className="flex gap-6">
                                            <div>
                                               <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> Date & Timings</p>
                                               <p className="text-sm text-paa-navy font-semibold">{new Date(evt.startDate || evt.date).toLocaleDateString()} • {(evt.startTime && evt.endTime) ? `${evt.startTime}-${evt.endTime}` : 'TBA'}</p>
                                            </div>
                                            <div>
                                               <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1">Fee</p>
                                               <p className="text-sm text-emerald-700 font-bold">₹{evt.registrationFee || 0}</p>
                                            </div>
                                         </div>"""
    
    replace4 = """                                         <div className="flex gap-6">
                                            <div>
                                               <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> Date & Timings</p>
                                               <p className="text-sm text-paa-navy font-semibold">{new Date(evt.startDate || evt.date).toLocaleDateString()} • {(evt.startTime && evt.endTime) ? `${evt.startTime}-${evt.endTime}` : 'TBA'}</p>
                                            </div>
                                            <div>
                                               <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1">Fee</p>
                                               <p className="text-sm text-emerald-700 font-bold">₹{evt.amountPaid || 0}</p>
                                            </div>
                                            {evt.isPast && (() => {
                                                let eventRev = 0;
                                                if (evt.manualTotalRevenue !== null && evt.manualTotalRevenue !== undefined) {
                                                   eventRev = evt.manualTotalRevenue;
                                                } else {
                                                   (evt.isInvite ? getEventBooks(evt.id) : (evt.books || [])).forEach((b: any) => eventRev += (b.soldStock || 0) * (b.mrp || b.book?.mrp || 0));
                                                }
                                                const eventPaid = evt.amountPaid || 0;
                                                const gain = eventRev - eventPaid;
                                                return (
                                                  <div>
                                                     <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1">Gain/Loss</p>
                                                     <p className={`text-sm font-bold ${gain >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{gain >= 0 ? '+' : '-'}₹{Math.abs(gain).toLocaleString()}</p>
                                                  </div>
                                                );
                                            })()}
                                         </div>"""
    content = content.replace(target4, replace4)

    # Fix 5: Tab Switcher and Payments Page
    target5_1 = """        <button onClick={() => setActiveTab('events')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'events' ? 'border-paa-navy text-paa-navy' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Events Overview</button>
        <button onClick={() => setActiveTab('performance')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'performance' ? 'border-paa-navy text-paa-navy' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Book Performance</button>
      </div>"""
      
    replace5_1 = """        <button onClick={() => setActiveTab('events')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'events' ? 'border-paa-navy text-paa-navy' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Events Overview</button>
        <button onClick={() => setActiveTab('performance')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'performance' ? 'border-paa-navy text-paa-navy' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Book Performance</button>
        <button onClick={() => setActiveTab('payments')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'payments' ? 'border-paa-navy text-paa-navy' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Payments History</button>
      </div>"""
    content = content.replace(target5_1, replace5_1)

    target5_2 = """      {activeTab === 'performance' && ("""
    replace5_2 = """      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
             <h3 className="text-lg font-bold text-paa-navy mb-4 border-b pb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-orange-500" /> Payments History</h3>
             <div className="space-y-4">
                {validParticipations.filter((e: any) => e.amountPaid > 0).length === 0 ? (
                    <p className="text-gray-500 italic text-sm">No payment records found.</p>
                ) : (
                    validParticipations.filter((e: any) => e.amountPaid > 0).map((evt: any, idx: number) => (
                        <div key={idx} className="flex flex-col md:flex-row items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div>
                                <h4 className="font-bold text-gray-800 text-lg">{evt.name}</h4>
                                <p className="text-xs text-gray-500 font-medium mt-1">{new Date(evt.startDate || evt.date).toLocaleDateString()} • {evt.location}</p>
                                {evt.transactionId && <p className="text-xs font-mono text-indigo-600 mt-2 bg-indigo-50 px-2 py-1 rounded inline-block">Txn: {evt.transactionId}</p>}
                            </div>
                            <div className="flex items-center gap-6 mt-4 md:mt-0">
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Amount Paid</p>
                                    <p className="font-black text-2xl text-orange-700">₹{evt.amountPaid.toLocaleString()}</p>
                                </div>
                                {(evt.paymentProofUrl || evt.paymentProofUrl || evt.paymentScreenshotUrl) ? (
                                    <a href={(evt.paymentProofUrl || evt.paymentScreenshotUrl).startsWith('http') ? (evt.paymentProofUrl || evt.paymentScreenshotUrl) : `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${evt.paymentProofUrl || evt.paymentScreenshotUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:text-paa-navy transition-colors text-sm font-bold shadow-sm">
                                        <ImageIcon className="w-4 h-4" /> View Proof
                                    </a>
                                ) : (
                                    <span className="text-xs text-gray-400 italic">No Screenshot</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
             </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && ("""
    content = content.replace(target5_2, replace5_2)

    with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

    print("SUCCESS")

if __name__ == '__main__':
    fix_author_dashboard()
