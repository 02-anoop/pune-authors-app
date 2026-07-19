import os

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Update titles data mapping
old_titles_data = """  const titlesData = authorBooks.map((b: any, index: number) => {
    const sold = authorOrders.filter((o: any) => o.bookTitle === b.title && (o.status === 'Completed' || o.status === 'Dispatched')).reduce((acc: number, curr: any) => acc + curr.quantity, 0);
    return {
      sno: index + 1,
      id: b.id,
      title: b.title,
      date: new Date(b.createdAt).toLocaleDateString('en-GB'),
      mrp: `₹${b.mrp}`,
      overpriced: b.overpriced ? 'Yes' : 'No',
      pub: 'Self-Published',
      genre: b.genre,
      sold: sold,
      status: b.status,
      rejectionReason: b.rejectionReason,
      stock: b.stock
    };
  });"""

new_titles_data = """  const titlesData = authorBooks.map((b: any, index: number) => {
    const webSales = authorOrders.filter((o: any) => o.bookTitle === b.title && (o.status === 'Completed' || o.status === 'Dispatched')).reduce((acc: number, curr: any) => acc + curr.quantity, 0);
    const eventSales = (data.listedBooks || []).filter((lb: any) => lb.bookId === b.id).reduce((acc: number, curr: any) => acc + (curr.soldStock || 0), 0);
    const totalSold = webSales + eventSales;
    return {
      sno: index + 1,
      id: b.id,
      title: b.title,
      date: new Date(b.createdAt).toLocaleDateString('en-GB'),
      mrp: `₹${b.mrp}`,
      overpriced: b.overpriced ? 'Yes' : 'No',
      pub: 'Self-Published',
      genre: b.genre,
      sold: { total: totalSold, web: webSales, events: eventSales },
      status: b.status,
      rejectionReason: b.rejectionReason,
      stock: b.stock
    };
  });"""

content = content.replace(old_titles_data, new_titles_data)

# Update chart data
content = content.replace(
    "const chartData = titlesData.map((t: any) => ({ name: t.title.substring(0, 15) + '...', sold: t.sold }));",
    "const chartData = titlesData.map((t: any) => ({ name: t.title.substring(0, 15) + '...', sold: t.sold.total }));"
)

# Update table headers
content = content.replace(
    "<th>Genre</th><th>MRP</th><th>Stock</th><th>Sold</th><th>Date</th><th className=\"text-center\">Actions</th>",
    "<th>Genre</th><th>MRP</th><th>Current Stock</th><th>Sold Details</th><th>Listing Date</th><th className=\"text-center\">Actions</th>"
)

# Update table cell for sold
old_td_sold = """<td className="font-semibold text-emerald-700">{row.sold}</td>"""
new_td_sold = """<td>
                    <div className="flex flex-col">
                       <span className="font-semibold text-emerald-700 text-sm">{row.sold.total} Total</span>
                       <span className="text-[10px] text-paa-gray-text font-bold uppercase tracking-widest">{row.sold.events} Events | {row.sold.web} Web</span>
                    </div>
                  </td>"""
content = content.replace(old_td_sold, new_td_sold)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Overview updated successfully.")
