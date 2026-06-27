import os
import re

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Enrich allTransactions
old_all_tx = """  const allTransactions = [
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

new_all_tx = """  const allTransactions = [
    ...webOrders.map((o: any) => ({
       rawDate: new Date(o.createdAt).getTime(),
       type: 'Web',
       date: new Date(o.createdAt).toLocaleString('en-GB'),
       id: `WEB-${o.orderId}`,
       customer: o.customerName || 'N/A',
       email: o.customerEmail || 'N/A',
       phone: o.customerPhone || 'N/A',
       address: (o.address || 'N/A').replace(/,/g, ' '),
       items: `${o.bookTitle} (x${o.quantity})`,
       quantity: o.quantity,
       amount: o.amount,
       status: o.status
    })),
    ...posOrders.map((o: any) => ({
       rawDate: new Date(o.createdAt).getTime(),
       type: 'POS',
       date: new Date(o.createdAt).toLocaleString('en-GB'),
       id: `POS-${o.id}`,
       customer: 'Walk-in',
       email: 'N/A',
       phone: 'N/A',
       address: 'N/A',
       items: o.items.map((i: any) => `${i.book.title} (x${i.quantity})`).join('; '),
       quantity: o.items.reduce((acc: number, i: any) => acc + i.quantity, 0),
       amount: o.totalAmount,
       status: o.paymentMethod
    }))
  ].sort((a, b) => b.rawDate - a.rawDate);"""
content = content.replace(old_all_tx, new_all_tx)

# 2. Update exportCSV function
old_export_csv = """  const exportCSV = () => {
    let csv = 'Date,Web Sales,POS Sales,Total Revenue,Books Sold\\n';
    chartData.forEach(row => {
      csv += `"${row.date}","₹${row.webSales}","₹${row.posSales}","₹${row.totalRevenue}","${row.totalBooks}"\\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `author_sales_report_${reportPeriod}.csv`;
    a.click();
  };"""

new_export_csv = """  const exportCSV = () => {
    let csv = 'Transaction Date,Order Type,Order ID,Customer Name,Email,Phone,Delivery Address,Books Included,Total Quantity,Total Amount,Status/Payment Method\\n';
    allTransactions.forEach(tx => {
      csv += `"${tx.date}","${tx.type}","${tx.id}","${tx.customer}","${tx.email}","${tx.phone}","${tx.address}","${tx.items}","${tx.quantity}","₹${tx.amount}","${tx.status}"\\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `detailed_sales_report_${reportPeriod}.csv`;
    a.click();
  };"""
content = content.replace(old_export_csv, new_export_csv)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Detailed CSV export generated.")
