with open('src/app/components/OperationsDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_extra = '''             {authorProfile.extraData && Object.keys(authorProfile.extraData).length > 0 && (
                <div className="md:col-span-2 mt-4">
                   <p className="text-xs font-bold uppercase tracking-widest text-paa-gray-text mb-2 border-b pb-1">Additional Required Details</p>
                   <div className="grid grid-cols-2 gap-4">
                     {Object.entries(authorProfile.extraData).map(([key, val]) => (
                        <div key={key}>
                           <p className="text-xs font-bold uppercase tracking-widest text-paa-gray-text mb-1">{key}</p>
                           <p className="text-sm font-medium text-paa-navy">{String(val)}</p>
                        </div>
                     ))}
                   </div>
                </div>
             )}
          </div>
        </div>
        )}
        </div>
      </div>
    </div>
  );
};'''

new_extra = '''             {authorProfile.extraData && Object.keys(authorProfile.extraData).length > 0 && (
                <div className="md:col-span-2 mt-4">
                   <p className="text-xs font-bold uppercase tracking-widest text-paa-gray-text mb-2 border-b pb-1">Additional Required Details</p>
                   <div className="grid grid-cols-2 gap-4">
                     {Object.entries(authorProfile.extraData).map(([key, val]) => (
                        <div key={key}>
                           <p className="text-xs font-bold uppercase tracking-widest text-paa-gray-text mb-1">{key}</p>
                           <p className="text-sm font-medium text-paa-navy">{String(val)}</p>
                        </div>
                     ))}
                   </div>
                </div>
             )}

             <div className="md:col-span-2 mt-4">
                <p className="text-xs font-bold uppercase tracking-widest text-paa-gray-text mb-2 border-b pb-1">Registration Payment Details</p>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-paa-gray-text mb-1">Transaction ID</p>
                      <p className="text-sm font-medium text-paa-navy">{authorProfile.transactionId || 'No Transaction ID Provided'}</p>
                   </div>
                   <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-paa-gray-text mb-1">Payment Screenshot</p>
                      {authorProfile.paymentScreenshot ? (
                         <a href={import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + authorProfile.paymentScreenshot : "http://localhost:3001" + authorProfile.paymentScreenshot} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 underline hover:text-blue-800">
                            View Uploaded Receipt
                         </a>
                      ) : (
                         <p className="text-sm font-medium text-red-500">No Receipt Uploaded</p>
                      )}
                   </div>
                </div>
             </div>
          </div>
        </div>
        )}
        </div>
      </div>
    </div>
  );
};'''

content = content.replace(old_extra, new_extra)

with open('src/app/components/OperationsDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated OperationsDashboardPage.tsx with payment details")
