import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Invoice Function
old_invoice = """  const handlePrintInvoice = (ord: any) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Shipping Label - PAA-${ord.orderId.toString().padStart(4, '0')}</title>
    <style>body{font-family:Arial,sans-serif;padding:20px;color:#000} .container{border:2px solid #000;padding:20px;max-width:500px;margin:0 auto} h1{font-size:20px;margin:0 0 15px;border-bottom:2px solid #000;padding-bottom:10px;text-transform:uppercase;text-align:center} .row{display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px} .label{font-weight:bold;width:140px;text-transform:uppercase;font-size:12px;color:#555} .val{font-weight:bold;max-width:60%;text-align:right} @media print{button{display:none}}</style>
    </head><body>
    <div class="container">
      <h1>Shipping Label</h1>
      <div class="row"><div class="label">Order ID:</div><div class="val">#PAA-${ord.orderId.toString().padStart(4, '0')}</div></div>
      <div class="row"><div class="label">Date:</div><div class="val">${ord.date}</div></div>
      <div class="row"><div class="label">Book Title:</div><div class="val">${ord.bookTitle}</div></div>
      <div class="row"><div class="label">Quantity:</div><div class="val">${ord.quantity}</div></div>
      <div class="row"><div class="label">Amount Paid:</div><div class="val">₹${ord.amount}</div></div>
      <hr style="margin:15px 0;border:none;border-top:1px dashed #ccc"/>
      <div class="row"><div class="label">Deliver To:</div><div class="val" style="font-size:16px">${ord.customerName}</div></div>
      <div class="row"><div class="label">Phone:</div><div class="val">${ord.customerPhone || 'N/A'}</div></div>
      <div class="row"><div class="label">Email:</div><div class="val">${ord.customerEmail || 'N/A'}</div></div>
      <div class="row"><div class="label">Address:</div><div class="val">${ord.address}</div></div>
      <br/><br/>
      <button onclick="window.print()" style="padding:10px 20px;background:#1a1a2e;color:#fff;border:none;cursor:pointer;width:100%;font-weight:bold;font-size:16px">PRINT LABEL</button>
    </div>
    </body></html>`);
    win.document.close();
  };"""

new_invoice = """  const handlePrintInvoice = (ord: any) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Invoice / Shipping Label - PAA-${ord.orderId.toString().padStart(4, '0')}</title>
    <style>
      body { font-family: 'Times New Roman', serif; padding: 0; margin: 0; color: #000; background: #fff; }
      @page { size: A4; margin: 20mm; }
      .container { max-width: 800px; margin: 0 auto; padding: 40px; border: 1px solid #ccc; box-sizing: border-box; }
      .header { text-align: center; border-bottom: 2px solid #1a1a2e; padding-bottom: 20px; margin-bottom: 30px; }
      .header h1 { margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px; color: #1a1a2e; }
      .header p { margin: 5px 0 0; font-size: 14px; color: #555; }
      .invoice-title { font-size: 22px; font-weight: bold; margin-bottom: 20px; text-align: center; text-transform: uppercase; letter-spacing: 1px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
      .box { border: 1px solid #ddd; padding: 20px; border-radius: 8px; background: #fafafa; }
      .box h3 { margin-top: 0; font-size: 14px; text-transform: uppercase; color: #666; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 15px; }
      .row { display: flex; margin-bottom: 10px; font-size: 14px; }
      .label { font-weight: bold; width: 120px; color: #333; }
      .val { flex: 1; }
      .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
      .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
      .table th { background: #f4f4f5; text-transform: uppercase; font-size: 12px; color: #555; }
      .table td { font-size: 14px; }
      .total-row { font-weight: bold; font-size: 16px; }
      .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
      .print-btn { display: block; margin: 20px auto; padding: 12px 30px; background: #1a1a2e; color: #fff; border: none; font-size: 16px; cursor: pointer; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
      @media print { .print-btn { display: none; } .container { border: none; padding: 0; } }
    </style>
    </head><body>
    <button class="print-btn" onclick="window.print()">Print Invoice</button>
    <div class="container">
      <div class="header">
        <h1>Pune Authors' Association</h1>
        <p>Connecting Authors, Inspiring Readers</p>
      </div>
      <div class="invoice-title">Tax Invoice / Shipping Label</div>
      
      <div class="grid">
        <div class="box">
          <h3>Order Information</h3>
          <div class="row"><div class="label">Order ID:</div><div class="val">#PAA-${ord.orderId.toString().padStart(4, '0')}</div></div>
          <div class="row"><div class="label">Order Date:</div><div class="val">${ord.date}</div></div>
          <div class="row"><div class="label">Payment:</div><div class="val">${ord.paymentScreenshot ? 'Paid' : 'Pending'}</div></div>
        </div>
        
        <div class="box">
          <h3>Shipping Address</h3>
          <div class="row"><div class="label">Name:</div><div class="val" style="font-weight:bold">${ord.customerName}</div></div>
          <div class="row"><div class="label">Phone:</div><div class="val">${ord.customerPhone || 'N/A'}</div></div>
          <div class="row"><div class="label">Email:</div><div class="val">${ord.customerEmail || 'N/A'}</div></div>
          <div class="row"><div class="label">Address:</div><div class="val">${ord.address}</div></div>
        </div>
      </div>
      
      <table class="table">
        <thead>
          <tr>
            <th>Item Description</th>
            <th style="text-align:center;width:100px;">Qty</th>
            <th style="text-align:right;width:150px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${ord.bookTitle}</td>
            <td style="text-align:center">${ord.quantity}</td>
            <td style="text-align:right">₹${ord.amount}</td>
          </tr>
          <tr class="total-row">
            <td colspan="2" style="text-align:right">Grand Total:</td>
            <td style="text-align:right">₹${ord.amount}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="footer">
        <p>Thank you for supporting authors directly through the Pune Authors' Association platform.</p>
        <p>This is a computer-generated invoice and does not require a physical signature.</p>
      </div>
    </div>
    </body></html>`);
    win.document.close();
  };"""

content = content.replace(old_invoice, new_invoice)


# 2. Add filters and sort to AuthorOrders
old_author_orders_start = """function AuthorOrders({ orders, onRefresh }: { orders: any[], onRefresh: () => void }) {
  const [loadingAction, setLoadingAction] = useState<number | null>(null);

  const handleAccept = async (id: number) => {"""

new_author_orders_start = """function AuthorOrders({ orders, onRefresh }: { orders: any[], onRefresh: () => void }) {
  const [loadingAction, setLoadingAction] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc');

  const filteredOrders = orders
    .filter(o => filterStatus === 'All' ? true : o.status === filterStatus)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const handleAccept = async (id: number) => {"""

content = content.replace(old_author_orders_start, new_author_orders_start)


# 3. Add Filter UI
old_table_header = """  return (
    <div>
      <h1 className="text-4xl font-serif text-paa-navy mb-8 text-center uppercase">MY WEB ORDERS</h1>
      <div className="bg-white border border-paa-navy/10 overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">"""

new_table_header = """  return (
    <div>
      <h1 className="text-4xl font-serif text-paa-navy mb-6 text-center uppercase">MY WEB ORDERS</h1>
      
      <div className="mb-6 flex flex-wrap gap-4 bg-white p-4 border border-paa-navy/10 items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Filter By Status:</span>
          <select 
            className="border border-paa-navy/20 p-2 text-sm bg-gray-50 outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Orders</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Accepted">Accepted</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Sort Date:</span>
          <select 
            className="border border-paa-navy/20 p-2 text-sm bg-gray-50 outline-none"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-paa-navy/10 overflow-hidden mb-12 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">"""

content = content.replace(old_table_header, new_table_header)


# 4. Use filteredOrders mapping instead of orders
old_map = """{orders.length === 0 ? <tr><td colSpan={7} className="p-4 text-center">No orders received yet.</td></tr> : orders.map((ord, idx) => ("""
new_map = """{filteredOrders.length === 0 ? <tr><td colSpan={7} className="p-4 text-center">No matching orders found.</td></tr> : filteredOrders.map((ord, idx) => ("""
content = content.replace(old_map, new_map)

# 5. Fix Cancelled badge style
old_badge = """<span className={`inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${ord.status === 'Completed' ? 'bg-[#5cb85c] text-white border-[#4cae4c]' : ord.status === 'Dispatched' ? 'bg-[#5bc0de] text-white border-[#46b8da]' : ord.status === 'Accepted' ? 'bg-[#337ab7] text-white border-[#2e6da4]' : ord.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-gray-200 text-paa-gray-text border-gray-300'}`}>"""

new_badge = """<span className={`inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${ord.status === 'Completed' ? 'bg-[#5cb85c] text-white border-[#4cae4c]' : ord.status === 'Dispatched' ? 'bg-[#5bc0de] text-white border-[#46b8da]' : ord.status === 'Accepted' ? 'bg-[#337ab7] text-white border-[#2e6da4]' : (ord.status === 'Rejected' || ord.status === 'Cancelled') ? 'bg-red-100 text-red-800 border-red-300' : 'bg-gray-200 text-paa-gray-text border-gray-300'}`}>"""

content = content.replace(old_badge, new_badge)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Frontend invoice and filters patched successfully")
