import sys

def fix_file():
    with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Part 1: Payment column logic
    target_col = """<td className="px-4 py-3 text-sm font-bold text-orange-700 text-right">{evt.amountPaid ? `₹${evt.amountPaid}` : '-'}</td>"""
    
    replacement_col = """<td className="px-4 py-3 text-sm font-bold text-orange-700 text-right">
                         {evt.amountPaid ? `₹${evt.amountPaid}` : (evt.isPast ? '-' : (evt.registrationFee ? `₹${evt.registrationFee}${evt.feeType === 'Per Title' ? '/title' : ''}` : '-'))}
                      </td>"""

    content = content.replace(target_col, replacement_col)

    # Part 2: Add Transaction ID and Screenshot in Down Arrow
    target_info = """                                             <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1">Fee</p>
                                                <p className="text-sm text-emerald-700 font-bold">₹{evt.registrationFee || 0}</p>
                                             </div>
                                          </div>"""

    replacement_info = """                                             <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1">Fee</p>
                                                <p className="text-sm text-emerald-700 font-bold">₹{evt.registrationFee || 0}</p>
                                             </div>
                                             {(evt.transactionId || (evt.paymentStatus && evt.paymentStatus !== '-' && evt.paymentStatus !== 'Unpaid')) && (
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1">Transaction ID</p>
                                                    <p className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200">{evt.transactionId || 'Paid'}</p>
                                                </div>
                                             )}
                                             {(evt.paymentScreenshot || evt.paymentProofUrl || evt.paymentProof) && (
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1">Payment Proof</p>
                                                    <a href={(evt.paymentScreenshot || evt.paymentProofUrl || evt.paymentProof).startsWith('http') ? (evt.paymentScreenshot || evt.paymentProofUrl || evt.paymentProof) : `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${evt.paymentScreenshot || evt.paymentProofUrl || evt.paymentProof}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                                                       <Eye className="w-3 h-3" /> View Receipt
                                                    </a>
                                                </div>
                                             )}
                                          </div>"""

    content = content.replace(target_info, replacement_info)
    
    # Part 3: Map Transaction ID from API
    target_map = """      registration: inv.optInStatus,
      paymentStatus: inv.paymentStatus,"""
      
    replacement_map = """      registration: inv.optInStatus,
      paymentStatus: inv.paymentStatus,
      transactionId: inv.transactionId,
      paymentProofUrl: inv.paymentProofUrl || inv.paymentScreenshotUrl || inv.paymentProof,"""

    content = content.replace(target_map, replacement_map)

    with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("SUCCESSFULLY ADDED PAYMENT DETAILS")

if __name__ == '__main__':
    fix_file()
