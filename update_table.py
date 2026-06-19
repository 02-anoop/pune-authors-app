with open('src/app/components/OperationsDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_header = '''             <tr>
               <th className="px-6 py-4">Author Details</th>
               <th className="px-6 py-4">Contact</th>
               <th className="px-6 py-4 text-center">Status</th>
               <th className="px-6 py-4 text-center">Books</th>
               <th className="px-6 py-4 text-center">Events</th>
               <th className="px-6 py-4 text-center">Actions</th>
             </tr>'''

new_header = '''             <tr>
               <th className="px-6 py-4">Author Details</th>
               <th className="px-6 py-4">Contact</th>
               <th className="px-6 py-4">Payment Info</th>
               <th className="px-6 py-4 text-center">Status</th>
               <th className="px-6 py-4 text-center">Books</th>
               <th className="px-6 py-4 text-center">Events</th>
               <th className="px-6 py-4 text-center">Actions</th>
             </tr>'''

old_row = '''                 <td className="px-6 py-4">
                    <p className="text-paa-navy font-medium">{author.email}</p>
                    <p className="text-paa-gray-text text-xs mt-0.5 font-medium">{author.phone}</p>
                 </td>
                 <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${author.status === 'Active' ? 'bg-[#5cb85c] text-white border-[#4cae4c]' : author.status === 'Rejected' ? 'bg-[#d9534f] text-white border-[#c9302c]' : 'bg-[#f0ad4e] text-white border-[#eea236]'}`}>'''

new_row = '''                 <td className="px-6 py-4">
                    <p className="text-paa-navy font-medium">{author.email}</p>
                    <p className="text-paa-gray-text text-xs mt-0.5 font-medium">{author.phone}</p>
                 </td>
                 <td className="px-6 py-4">
                    {author.transactionId ? (
                      <div>
                        <p className="text-[10px] font-bold text-paa-navy uppercase bg-gray-100 inline-block px-1 mb-1">TXN: {author.transactionId}</p>
                        <br />
                        {author.paymentScreenshot ? (
                           <a href={import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + author.paymentScreenshot : "http://localhost:3001" + author.paymentScreenshot} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline font-medium mt-1 inline-block hover:text-blue-800">View Receipt</a>
                        ) : (
                           <span className="text-[10px] text-red-500 font-bold uppercase block mt-1">No Receipt</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-bold uppercase">No Payment Info</span>
                    )}
                 </td>
                 <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${author.status === 'Active' ? 'bg-[#5cb85c] text-white border-[#4cae4c]' : author.status === 'Rejected' ? 'bg-[#d9534f] text-white border-[#c9302c]' : 'bg-[#f0ad4e] text-white border-[#eea236]'}`}>'''

content = content.replace(old_header, new_header)
content = content.replace(old_row, new_row)

old_colspan = '''<td colSpan={6} className="text-center py-8 text-paa-gray-text bg-white">No authors found.</td>'''
new_colspan = '''<td colSpan={7} className="text-center py-8 text-paa-gray-text bg-white">No authors found.</td>'''
content = content.replace(old_colspan, new_colspan)

with open('src/app/components/OperationsDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated OperationsDashboardPage.tsx with table column for Payment Info")
