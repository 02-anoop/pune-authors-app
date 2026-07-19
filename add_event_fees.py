import os
import re

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# --- 1. OverviewTab changes ---
fee_calc = """  const totalEventFees = (data.eventInvites || []).filter((inv: any) => inv.optInStatus === 'Opted-In').reduce((acc: number, inv: any) => {
    const evt = inv.event;
    if (!evt) return acc;
    if (evt.feeType === 'Flat Fee' || evt.feeType === 'Per Author') {
      return acc + (evt.registrationFee || 0);
    } else if (evt.feeType === 'Per Title') {
      const titlesCount = (data.listedBooks || []).filter((lb: any) => lb.eventId === evt.id).length;
      return acc + ((evt.registrationFee || 0) * titlesCount);
    }
    return acc;
  }, 0);
  const totalFeesPaid = 1000 + totalEventFees;"""

# Inject before `const actionItems: any[] = [];` in OverviewTab
content = content.replace("const actionItems: any[] = [];", fee_calc + "\n\n  const actionItems: any[] = [];")

# Update Overview cards
old_overview_kpi = """        {[
          { label: 'Total Titles', value: authorBooks.length, colorClass: 'blue' },
          { label: 'Total Stock', value: authorBooks.reduce((a: number, b: any) => a + b.stock, 0), colorClass: 'green' },
          { label: 'Total Earnings', value: '\u20b9' + grossSales.toFixed(0), colorClass: 'amber' },
          { label: 'Platform Reg. Fee Paid', value: '\u20b91000', colorClass: 'red' },
        ].map((kpi, i) => ("""

new_overview_kpi = """        {[
          { label: 'Total Titles', value: authorBooks.length, colorClass: 'blue' },
          { label: 'Total Stock', value: authorBooks.reduce((a: number, b: any) => a + b.stock, 0), colorClass: 'green' },
          { label: 'Total Earnings', value: '\u20b9' + grossSales.toFixed(0), colorClass: 'amber' },
          { label: 'Total Fees Paid', value: '\u20b9' + totalFeesPaid, colorClass: 'red' },
        ].map((kpi, i) => ("""
content = content.replace(old_overview_kpi, new_overview_kpi)

# --- 2. AuthorSalesReport changes ---
old_sales_metrics = """  const totalWebRevenue = webOrders.reduce((acc: number, o: any) => acc + o.amount, 0);
  const totalPosRevenue = posOrders.reduce((acc: number, o: any) => acc + o.totalAmount, 0);
  const totalBooksSold = chartData.reduce((acc, curr) => acc + curr.totalBooks, 0);
  const totalRevenue = totalWebRevenue + totalPosRevenue;
  const platformFeePaid = 1000;"""

new_sales_metrics = """  const totalWebRevenue = webOrders.reduce((acc: number, o: any) => acc + o.amount, 0);
  const totalPosRevenue = posOrders.reduce((acc: number, o: any) => acc + o.totalAmount, 0);
  const totalBooksSold = chartData.reduce((acc, curr) => acc + curr.totalBooks, 0);
  const totalRevenue = totalWebRevenue + totalPosRevenue;
  
  const totalEventFees = (data.eventInvites || []).filter((inv: any) => inv.optInStatus === 'Opted-In').reduce((acc: number, inv: any) => {
    const evt = inv.event;
    if (!evt) return acc;
    if (evt.feeType === 'Flat Fee' || evt.feeType === 'Per Author') {
      return acc + (evt.registrationFee || 0);
    } else if (evt.feeType === 'Per Title') {
      const titlesCount = (data.listedBooks || []).filter((lb: any) => lb.eventId === evt.id).length;
      return acc + ((evt.registrationFee || 0) * titlesCount);
    }
    return acc;
  }, 0);
  const platformFeePaid = 1000;
  const totalFeesPaid = platformFeePaid + totalEventFees;"""
content = content.replace(old_sales_metrics, new_sales_metrics)

old_sales_cards = """        <div className="bg-white p-4 rounded-xl border shadow-sm">
           <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Total Revenue</p>
           <div className="text-2xl font-bold text-paa-navy">₹{totalRevenue}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
           <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Registration Fee Paid</p>
           <div className="text-2xl font-bold text-red-600">₹{platformFeePaid}</div>
        </div>"""

new_sales_cards = """        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col justify-between">
           <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Total Revenue</p>
           <div className="text-2xl font-bold text-paa-navy">₹{totalRevenue}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col justify-between relative group">
           <p className="text-[10px] font-bold uppercase tracking-widest text-paa-gray-text mb-1">Total Fees Paid</p>
           <div className="text-2xl font-bold text-red-600">₹{totalFeesPaid}</div>
           <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 w-max bg-gray-900 text-white text-xs p-2 rounded shadow-lg z-50">
             Platform Fee: ₹{platformFeePaid}<br/>
             Event Fees: ₹{totalEventFees}
           </div>
        </div>"""
content = content.replace(old_sales_cards, new_sales_cards)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Event registration fees logic added.")
