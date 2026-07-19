const fs = require('fs');

let c = fs.readFileSync('src/app/components/AuthorDashboardPage.tsx', 'utf8');

const tableTargetRegex = new RegExp(`<div className="overflow-x-auto">\\s*<table className="w-full text-left border-collapse">[\\s\\S]*?<tbody className="divide-y divide-gray-100">[\\s\\S]*?\\{filteredEvents.map\\(\\(evt: any, i: number\\) => \\{[\\s\\S]*?return \\(\\s*<React.Fragment key=\\{i\\}>[\\s\\S]*?<td colSpan=\\{8\\} className="p-0">`);

const tableReplacement = `<div className="bg-white rounded-xl shadow-premium border border-paa-navy/5 overflow-hidden mb-8">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#f0f4f8] text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">
                  <th className="px-6 py-4 w-12 text-center"></th>
                  <th className="px-4 py-4 w-1/4">Event Name</th>
                  <th className="px-4 py-4 w-32">Date</th>
                  <th className="px-4 py-4">Location</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4 text-right">Books Sold</th>
                  <th className="px-4 py-4 text-right">Revenue</th>
                  <th className="px-4 py-4 text-right">Payment</th>
                  <th className="px-4 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEvents.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-sm text-paa-gray-text italic">No events found.</td></tr>}
                {filteredEvents.map((evt: any, i: number) => {
                  let sold = 0;
                  let rev = 0;
                  if (evt.manualTotalSold !== null && evt.manualTotalSold !== undefined) {
                    sold = evt.manualTotalSold;
                    rev = evt.manualTotalRevenue || 0;
                  } else if (evt.isPast && evt.isDataUpdated) {
                    evt.books?.forEach((b: any) => {
                      sold += (b.soldStock || 0);
                      rev += (b.soldStock || 0) * (b.mrp || b.book?.mrp || 0);
                    });
                  } else if (evt.isInvite) {
                    const evtBooks = getEventBooks(evt.id);
                    evtBooks.forEach((b: any) => {
                      sold += (b.soldStock || 0);
                      rev += (b.soldStock || 0) * (b.book?.mrp || 0);
                    });
                  }

                  return (
                    <React.Fragment key={i}>
                    <tr className={\`hover:bg-gray-50 transition-colors \${expandedEventId === evt.id ? 'bg-gray-50' : ''}\`}>
                      <td className="pl-6 pr-2 py-3 text-center cursor-pointer" onClick={() => { 
                         setExpandedEventId(expandedEventId === evt.id ? null : evt.id);
                         if (expandedEventId !== evt.id && evt.isInvite && evt.registration === 'Pending') {
                            setSelectedInvite(evt);
                            setOptInBooks(books.map((b: any) => ({ bookId: b.id.toString(), title: b.title, stock: 10, included: true })));
                            setPaymentScreenshot(null);
                         }
                      }}>
                         <button className="text-gray-400 hover:text-paa-navy transition-colors">
                            {expandedEventId === evt.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                         </button>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-paa-navy">{evt.name}</td>
                      <td className="px-4 py-3 text-sm font-medium text-paa-gray-text">{new Date(evt.startDate || evt.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm text-paa-gray-text">{evt.location || evt.venue || 'TBA'}</td>
                      <td className="px-4 py-3 text-sm font-semibold">
                         <div className="flex flex-col items-start gap-1">
                             <span className={\`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest \${evt.isPast ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}\`}>
                               {evt.type || (evt.isPast ? 'Past Event' : 'Upcoming/Live')}
                             </span>
                             {evt.registration === 'Not Participated' && evt.aggAuthors > 0 && (
                               <div className="text-[10px] text-gray-500 font-mono mt-1">{evt.aggAuthors} Authors</div>
                             )}
                         </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-paa-navy text-right">{sold > 0 || (evt.manualTotalSold !== null && evt.manualTotalSold !== undefined) ? sold : '-'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-700 text-right">{rev > 0 || (evt.manualTotalRevenue !== null && evt.manualTotalRevenue !== undefined) ? \`₹\${rev}\` : '-'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-orange-700 text-right">{evt.amountPaid ? \`₹\${evt.amountPaid}\` : '-'}</td>
                      <td className="px-4 py-3 text-center">
                          <span className={\`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest \${evt.registration === 'Registered' || evt.registration === 'Approved' ? 'bg-emerald-100 text-emerald-700' : (evt.registration === 'Pending' || evt.registration === 'Pending Approval' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700')}\`}>
                            {evt.registration}
                          </span>
                      </td>
                    </tr>
                    {expandedEventId === evt.id && (
                       <tr className="bg-[#f8fafc] border-b border-gray-100 shadow-inner">
                          <td colSpan={9} className="p-0">`;

c = c.replace(tableTargetRegex, tableReplacement);

fs.writeFileSync('src/app/components/AuthorDashboardPage.tsx', c);
console.log('Replaced table format successfully');
