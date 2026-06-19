with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update titlesData
old_titles_data = '''      pub: 'Self-Published',
      genre: b.genre,
      sold: sold,
      status: b.status,
      rejectionReason: b.rejectionReason
    };'''
new_titles_data = '''      pub: 'Self-Published',
      genre: b.genre,
      sold: sold,
      status: b.status,
      rejectionReason: b.rejectionReason,
      stock: b.stock
    };'''
content = content.replace(old_titles_data, new_titles_data)

# 2. Update Table Header
old_th = '''                <th className="p-3 border-r border-[#8faadc]">MRP</th>
                <th className="p-3 border-r border-[#8faadc]">Genre</th>
                <th className="p-3 border-r border-[#8faadc]">Books Sold</th>
                <th className="p-3">Change Cover</th>'''
new_th = '''                <th className="p-3 border-r border-[#8faadc]">MRP</th>
                <th className="p-3 border-r border-[#8faadc]">Genre</th>
                <th className="p-3 border-r border-[#8faadc]">Stock</th>
                <th className="p-3 border-r border-[#8faadc]">Books Sold</th>
                <th className="p-3">Change Cover</th>'''
content = content.replace(old_th, new_th)

# 3. Update Table Row
old_td = '''                  <td className="p-3 border-r border-paa-navy/5">{row.mrp}</td>
                  <td className="p-3 border-r border-paa-navy/5">{row.genre}</td>
                  <td className="p-3 border-r border-paa-navy/5 font-bold text-paa-navy">{row.sold}</td>
                  <td className="p-3 text-center">'''
new_td = '''                  <td className="p-3 border-r border-paa-navy/5">{row.mrp}</td>
                  <td className="p-3 border-r border-paa-navy/5">{row.genre}</td>
                  <td className="p-3 border-r border-paa-navy/5 font-bold bg-yellow-50">{row.stock}</td>
                  <td className="p-3 border-r border-paa-navy/5 font-bold text-paa-navy">{row.sold}</td>
                  <td className="p-3 text-center">'''
content = content.replace(old_td, new_td)

with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AuthorDashboardPage.tsx stock field")
