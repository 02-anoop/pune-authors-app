import os
import re

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update OverviewTab KPI cards
old_overview_kpi = """        {[
          { label: 'Total Titles', value: authorBooks.length, colorClass: 'blue' },
          { label: 'Total Stock', value: authorBooks.reduce((a: number, b: any) => a + b.stock, 0), colorClass: 'green' },
          { label: 'Gross Sales', value: '\u20b9' + grossSales.toFixed(0), colorClass: 'amber' },
          { label: 'Net Earnings 70%', value: '\u20b9' + netEarnings.toFixed(0), colorClass: 'red' },
        ].map((kpi, i) => ("""

new_overview_kpi = """        {[
          { label: 'Total Titles', value: authorBooks.length, colorClass: 'blue' },
          { label: 'Total Stock', value: authorBooks.reduce((a: number, b: any) => a + b.stock, 0), colorClass: 'green' },
          { label: 'Total Earnings', value: '\u20b9' + grossSales.toFixed(0), colorClass: 'amber' },
          { label: 'Platform Reg. Fee Paid', value: '\u20b91000', colorClass: 'red' },
        ].map((kpi, i) => ("""
content = content.replace(old_overview_kpi, new_overview_kpi)

# 2. Remove netEarnings calculation in OverviewTab
content = content.replace("const netEarnings = grossSales * 0.7;", "")

# 3. Update AuthorSalesReport metrics calculation
old_sales_metrics = """  const totalWebRevenue = webOrders.reduce((acc: number, o: any) => acc + o.amount, 0);
  const totalPosRevenue = posOrders.reduce((acc: number, o: any) => acc + o.totalAmount, 0);
  const totalBooksSold = chartData.reduce((acc, curr) => acc + curr.totalBooks, 0);
  const totalRevenue = totalWebRevenue + totalPosRevenue;
  const netEarnings = totalRevenue * 0.7;"""

new_sales_metrics = """  const totalWebRevenue = webOrders.reduce((acc: number, o: any) => acc + o.amount, 0);
  const totalPosRevenue = posOrders.reduce((acc: number, o: any) => acc + o.totalAmount, 0);
  const totalBooksSold = chartData.reduce((acc, curr) => acc + curr.totalBooks, 0);
  const totalRevenue = totalWebRevenue + totalPosRevenue;
  const platformFeePaid = 1000;"""
content = content.replace(old_sales_metrics, new_sales_metrics)

# 4. Update AuthorSalesReport cards
old_sales_cards = """        <div className="bg-white p-4 rounded-xl border shadow-sm">
           <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Total Revenue</p>
           <div className="text-2xl font-bold text-paa-navy">₹{totalRevenue}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
           <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Net Earnings (70%)</p>
           <div className="text-2xl font-bold text-green-600">₹{Math.round(netEarnings)}</div>
        </div>"""

new_sales_cards = """        <div className="bg-white p-4 rounded-xl border shadow-sm">
           <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Total Revenue</p>
           <div className="text-2xl font-bold text-paa-navy">₹{totalRevenue}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
           <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Registration Fee Paid</p>
           <div className="text-2xl font-bold text-red-600">₹{platformFeePaid}</div>
        </div>"""
content = content.replace(old_sales_cards, new_sales_cards)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Commission removed and registration fee added.")
