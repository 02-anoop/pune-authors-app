import sys

def fix_file():
    with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    target = """                                       })()}
                                   </div>
                                </div>"""

    replacement = """                                       })()}
                                   </div>
                                   {(() => {
                                      const payment = Number(evt.amountPaid) || 0;
                                      const net = rev - payment;
                                      const isGain = net > 0;
                                      const isLoss = net < 0;
                                      
                                      if (evt.isPast && !evt.isDataUpdated) return null; // Don't show profit/loss if data is pending
                                      
                                      return (
                                         <div className={`mt-3 pt-3 border-t ${isLoss ? 'border-red-100' : (isGain ? 'border-emerald-100' : 'border-gray-200')} flex items-center justify-between`}>
                                            <div className="flex gap-4">
                                               <div className="flex flex-col">
                                                  <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Revenue</span>
                                                  <span className="text-xs font-black text-paa-navy">₹{rev}</span>
                                               </div>
                                               <div className="flex flex-col">
                                                  <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Paid</span>
                                                  <span className="text-xs font-black text-gray-700">₹{payment}</span>
                                               </div>
                                            </div>
                                            <div className={`flex flex-col items-end px-3 py-1 rounded-lg ${isLoss ? 'bg-red-50' : (isGain ? 'bg-emerald-50' : 'bg-gray-50')}`}>
                                               <span className={`text-[9px] uppercase font-bold tracking-wider ${isLoss ? 'text-red-700' : (isGain ? 'text-emerald-700' : 'text-gray-600')}`}>
                                                  {isLoss ? 'Net Loss' : (isGain ? 'Net Profit' : 'Breakeven')}
                                               </span>
                                               <span className={`text-sm font-black ${isLoss ? 'text-red-600' : (isGain ? 'text-emerald-600' : 'text-gray-700')}`}>
                                                  {isLoss ? '-' : (isGain ? '+' : '')}₹{Math.abs(net)}
                                               </span>
                                            </div>
                                         </div>
                                      );
                                   })()}
                                </div>"""

    content = content.replace(target, replacement)

    with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("SUCCESSFULLY ADDED PROFIT/LOSS BLOCK")

if __name__ == '__main__':
    fix_file()
