import os
import re

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Generate the merged transactions array
transactions_logic = """  const totalWebRevenue = webOrders.reduce((acc: number, o: any) => acc + o.amount, 0);
  const totalPosRevenue = posOrders.reduce((acc: number, o: any) => acc + o.totalAmount, 0);
  const totalBooksSold = chartData.reduce((acc, curr) => acc + curr.totalBooks, 0);
  const totalRevenue = totalWebRevenue + totalPosRevenue;
  const netEarnings = totalRevenue * 0.7;

  const allTransactions = [
    ...webOrders.map((o: any) => ({
       rawDate: new Date(o.createdAt).getTime(),
       type: 'Web',
       date: new Date(o.createdAt).toLocaleString('en-GB'),
       id: `WEB-${o.orderId}`,
       customer: o.customerName || 'N/A',
       items: `${o.bookTitle} (x${o.quantity})`,
       amount: o.amount,
       status: o.status
    })),
    ...posOrders.map((o: any) => ({
       rawDate: new Date(o.createdAt).getTime(),
       type: 'POS',
       date: new Date(o.createdAt).toLocaleString('en-GB'),
       id: `POS-${o.id}`,
       customer: 'Walk-in',
       items: o.items.map((i: any) => `${i.book.title} (x${i.quantity})`).join(', '),
       amount: o.totalAmount,
       status: o.paymentMethod
    }))
  ].sort((a, b) => b.rawDate - a.rawDate);"""

content = content.replace("""  const totalWebRevenue = webOrders.reduce((acc: number, o: any) => acc + o.amount, 0);
  const totalPosRevenue = posOrders.reduce((acc: number, o: any) => acc + o.totalAmount, 0);
  const totalBooksSold = chartData.reduce((acc, curr) => acc + curr.totalBooks, 0);
  const totalRevenue = totalWebRevenue + totalPosRevenue;
  const netEarnings = totalRevenue * 0.7;""", transactions_logic)

# Add the detailed transactions table
detailed_table = """      <div className="bg-white border rounded-xl shadow-sm overflow-hidden mb-8">
         <div className="px-6 py-4 border-b">
            <h3 className="font-serif font-bold text-lg">Daily Breakdown</h3>
         </div>
         <div className="overflow-x-auto">
            <table className="dash-table">
               <thead>
                  <tr>
                     <th>Date</th>
                     <th>Web Sales</th>
                     <th>POS Sales</th>
                     <th>Total Revenue</th>
                     <th>Books Sold</th>
                  </tr>
               </thead>
               <tbody>
                  {chartData.length === 0 && (
                     <tr><td colSpan={5} className="text-center py-6 text-gray-400">No data available</td></tr>
                  )}
                  {chartData.reverse().map((row, i) => (
                     <tr key={i}>
                        <td className="font-semibold">{row.date}</td>
                        <td className="text-blue-600 font-semibold">₹{row.webSales}</td>
                        <td className="text-purple-600 font-semibold">₹{row.posSales}</td>
                        <td className="font-bold text-paa-navy">₹{row.totalRevenue}</td>
                        <td>{row.totalBooks}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
         <div className="px-6 py-4 border-b">
            <h3 className="font-serif font-bold text-lg">Detailed Transactions</h3>
         </div>
         <div className="overflow-x-auto">
            <table className="dash-table">
               <thead>
                  <tr>
                     <th>Date</th>
                     <th>Type</th>
                     <th>Order ID</th>
                     <th>Customer</th>
                     <th>Books Included</th>
                     <th>Amount</th>
                     <th>Status / Mode</th>
                  </tr>
               </thead>
               <tbody>
                  {allTransactions.length === 0 && (
                     <tr><td colSpan={7} className="text-center py-6 text-gray-400">No transactions found</td></tr>
                  )}
                  {allTransactions.map((tx, i) => (
                     <tr key={i}>
                        <td className="text-xs text-gray-500 whitespace-nowrap">{tx.date}</td>
                        <td><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${tx.type === 'Web' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{tx.type}</span></td>
                        <td className="font-mono text-xs">{tx.id}</td>
                        <td className="font-semibold text-paa-navy">{tx.customer}</td>
                        <td className="text-sm max-w-xs truncate" title={tx.items}>{tx.items}</td>
                        <td className="font-bold text-emerald-600 whitespace-nowrap">₹{tx.amount}</td>
                        <td><span className="text-xs text-gray-500 font-bold uppercase tracking-widest bg-gray-100 px-2 py-1 rounded">{tx.status}</span></td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>"""

# Replace the old daily breakdown block with the new one that includes both
content = re.sub(r'      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">\s*<div className="px-6 py-4 border-b">\s*<h3 className="font-serif font-bold text-lg">Daily Breakdown</h3>\s*</div>.*?</div>\s*</div>\s*</div>\s*\);\s*}', detailed_table + '\n    </div>\n  );\n}', content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Detailed transactions added to Author Sales Report.")
