import os

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    data = f.read()

# Replace the table layout for Events Registry
old_table_start = """        <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm animate-in fade-in duration-500">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-bold">Event Name</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Location</th>
                <th className="p-4 font-bold">Duration</th>
                <th className="p-4 font-bold text-right">Charges</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Authors</th>
                <th className="p-4 font-bold text-right">Books</th>
                <th className="p-4 font-bold text-right">Revenue</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">"""

new_table_start = """        <div className="mt-8 border border-paa-navy/5 rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-500">
          <div className="overflow-x-auto">
            <table className="dash-table w-full text-left min-w-[600px]">
              <thead className="bg-[#f0f4f8]">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-paa-navy/5">Event Name</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-paa-navy/5">Date</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-paa-navy/5">Location</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-paa-navy/5">Duration</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-paa-navy/5 text-right">Charges</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-paa-navy/5">Status</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-paa-navy/5 text-right">Authors</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-paa-navy/5 text-right">Books</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-paa-navy/5 text-right">Revenue</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-paa-navy border-b border-paa-navy/5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paa-navy/5 bg-white">"""

data = data.replace(old_table_start, new_table_start)

# Replace the TR mapping
old_tr = """                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-bold text-paa-navy">{evt.name}</td>
                        <td className="p-4 text-sm font-medium text-gray-600">{evt.date}</td>
                        <td className="p-4 text-sm font-medium text-gray-600">{evt.location || evt.address || 'TBA'}</td>
                        <td className="p-4">
                           <span className={`px-2.5 py-1 text-[10px] uppercase font-black tracking-widest rounded-full ${evt.isLegacy ? 'bg-gray-200 text-gray-700' : (evt.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700')}`}>
                              {evt.isLegacy ? 'Legacy Archive' : evt.status}
                           </span>
                        </td>
                        <td className="p-4 text-sm font-mono font-medium text-right">{authors}</td>
                        <td className="p-4 text-sm font-mono font-medium text-right">{books}</td>
                        <td className="p-4 text-sm font-mono text-right text-emerald-600 font-bold">{evt.isLegacy || revenue > 0 ? `₹${revenue}` : 'Auto-synced'}</td>
                        <td className="p-4 text-center">"""

new_tr = """                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-paa-navy">{evt.name}</td>
                        <td className="px-4 py-3 text-sm font-medium text-paa-gray-text">{evt.date}</td>
                        <td className="px-4 py-3 text-sm text-paa-gray-text">{evt.location || evt.address || 'TBA'}</td>
                        <td className="px-4 py-3 text-sm font-medium text-paa-gray-text">{evt.durationDays ? `${evt.durationDays} Days` : 'N/A'}</td>
                        <td className="px-4 py-3 text-sm font-bold text-paa-navy text-right">₹{evt.registrationFee || 0}</td>
                        <td className="px-4 py-3">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${evt.isLegacy ? 'bg-gray-200 text-gray-700' : (evt.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700')}`}>
                              {evt.isLegacy ? 'Legacy Archive' : evt.status}
                           </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-paa-navy text-right">{authors}</td>
                        <td className="px-4 py-3 text-sm font-bold text-paa-navy text-right">{books}</td>
                        <td className="px-4 py-3 text-sm font-bold text-green-700 text-right">{evt.isLegacy || revenue > 0 ? `₹${revenue}` : 'Auto-synced'}</td>
                        <td className="px-4 py-3 text-right">"""

data = data.replace(old_tr, new_tr)

# Fix close div structure at the end of the table
old_table_end = """              {allCombinedEvents.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-gray-500">No events found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>"""

new_table_end = """              {allCombinedEvents.length === 0 && <tr><td colSpan={10} className="text-center py-6 text-sm text-paa-gray-text italic">No events found.</td></tr>}
            </tbody>
          </table>
        </div>
        </div>
      </div>"""

data = data.replace(old_table_end, new_table_end)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(data)

print("Fixed Events Table!")
