import sys
import re

with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern1 = re.compile(r'<div className="flex gap-2 pt-2">\s*<button onClick=\{\(\) => setOptInEventId\(null\)\} className="flex-1 py-2 bg-gray-200 text-gray-700 text-xs font-bold uppercase transition-colors">Cancel</button>\s*<button onClick=\{\(\) => submitOptIn\(evt\.id\)\} disabled=\{buttonStates\[\'optIn_\' \+ evt\.id\]\} className="flex-1 py-2 bg-paa-navy hover:bg-paa-navy/90 text-white text-xs font-bold uppercase transition-colors disabled:opacity-50">\{buttonStates\[\'optIn_\' \+ evt\.id\] \? \'Confirming\.\.\.\' : \'Confirm\'\}</button>\s*</div>')

replace1 = """{(() => {
                                      let calculatedFee = 0;
                                      if (evt.feeType === 'Flat Fee') calculatedFee = evt.registrationFee;
                                      else if (evt.feeType === 'Per Author') calculatedFee = evt.registrationFee;
                                      else if (evt.feeType === 'Per Title') calculatedFee = evt.registrationFee * selectedBooksToLink.length;

                                      if (calculatedFee > 0) {
                                         return (
                                            <div className="bg-orange-50 p-4 border border-orange-200 rounded mt-4">
                                               <p className="text-sm font-bold text-orange-900 mb-2">Registration Fee: ₹{calculatedFee}</p>
                                               <p className="text-xs text-orange-800 mb-4">Please pay the registration fee using the QR code below and upload a screenshot of the successful payment.</p>
                                               
                                               <div className="flex flex-col items-center mb-4">
                                                  <img src={qrCode} alt="Payment QR" className="w-32 h-32 rounded border shadow-sm mb-2" />
                                                  <p className="text-xs font-bold text-gray-600">Scan to pay ₹{calculatedFee}</p>
                                               </div>

                                               <div>
                                                  <label className="text-[10px] font-bold uppercase tracking-widest text-paa-navy mb-1 block">Upload Payment Screenshot *</label>
                                                  <input type="file" accept="image/*" className="w-full border p-2 text-xs outline-none bg-white focus:border-paa-navy" onChange={(e) => {
                                                     if (e.target.files && e.target.files[0]) {
                                                        setPaymentScreenshotBlob(e.target.files[0]);
                                                     } else {
                                                        setPaymentScreenshotBlob(null);
                                                     }
                                                  }} />
                                               </div>
                                            </div>
                                         );
                                      }
                                      return null;
                                   })()}
                                   <div className="flex gap-2 pt-2 mt-4">
                                      <button onClick={() => { setOptInEventId(null); setPaymentScreenshotBlob(null); }} className="flex-1 py-2 bg-gray-200 text-gray-700 text-xs font-bold uppercase transition-colors">Cancel</button>
                                      <button onClick={() => submitOptIn(evt.id, evt)} disabled={buttonStates['optIn_' + evt.id] || (selectedBooksToLink.length === 0)} className="flex-1 py-2 bg-paa-navy hover:bg-paa-navy/90 text-white text-xs font-bold uppercase transition-colors disabled:opacity-50">{buttonStates['optIn_' + evt.id] ? 'Confirming...' : 'Confirm'}</button>
                                   </div>"""

pattern2 = re.compile(r'<button onClick=\{\(\) => \{ setOptInEventId\(evt\.id\); setSelectedBooksToLink\(\[\]\); \}\} className="w-full py-2 bg-paa-navy hover:bg-paa-navy/90 text-white text-xs font-bold uppercase tracking-widest transition-colors">')

replace2 = """<button onClick={() => { setOptInEventId(evt.id); setSelectedBooksToLink([]); setPaymentScreenshotBlob(null); }} className="w-full py-2 bg-paa-navy hover:bg-paa-navy/90 text-white text-xs font-bold uppercase tracking-widest transition-colors">"""

if pattern1.search(content):
    content = pattern1.sub(replace1, content)
    print("Replaced target 1")
else:
    print("Target 1 not found")

if pattern2.search(content):
    content = pattern2.sub(replace2, content)
    print("Replaced target 2")
else:
    print("Target 2 not found")

with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
