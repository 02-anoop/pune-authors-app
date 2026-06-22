import re

# 1. Update Backend (server/index.js)
backend_file = "c:/Users/arvin/Desktop/pune-authors-app/server/index.js"
with open(backend_file, "r", encoding="utf-8") as f:
    backend_content = f.read()

# Add customerPhone and Email to authorOrders mapping
if "customerPhone: item.order.customerPhone" not in backend_content:
    backend_content = backend_content.replace(
        "customerName: item.order.customerName,",
        "customerName: item.order.customerName,\n        customerPhone: item.order.customerPhone,\n        customerEmail: item.order.customerEmail,"
    )

with open(backend_file, "w", encoding="utf-8") as f:
    f.write(backend_content)
    print("Backend invoice patched")

# 2. Update Frontend (AuthorDashboardPage.tsx)
frontend_file = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/AuthorDashboardPage.tsx"
with open(frontend_file, "r", encoding="utf-8") as f:
    frontend_content = f.read()

if "handlePrintInvoice" not in frontend_content:
    print_invoice_fn = """
  const handlePrintInvoice = (ord: any) => {
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
  };
"""
    frontend_content = frontend_content.replace(
        "const handleDispatch = async (id: number) => {",
        print_invoice_fn + "\n  const handleDispatch = async (id: number) => {"
    )

    dispatch_button_old = """                      {ord.status === 'Accepted' && (
                        <button 
                          onClick={() => handleDispatch(ord.id)}
                          disabled={loadingAction === ord.id}
                          className="bg-[#5bc0de] text-white px-3 py-1 text-xs rounded shadow font-bold disabled:opacity-50 mt-2"
                        >
                          DISPATCH
                        </button>
                      )}"""
                      
    dispatch_button_new = """                      {ord.status === 'Accepted' && (
                        <div className="flex flex-col gap-2 mt-2">
                          <button 
                            onClick={() => handlePrintInvoice(ord)}
                            className="bg-[#1a1a2e] text-white px-3 py-1 text-xs rounded shadow font-bold tracking-widest uppercase hover:bg-black transition-colors"
                          >
                            PRINT INVOICE
                          </button>
                          <button 
                            onClick={() => handleDispatch(ord.id)}
                            disabled={loadingAction === ord.id}
                            className="bg-[#5bc0de] text-white px-3 py-1 text-xs rounded shadow font-bold disabled:opacity-50"
                          >
                            DISPATCH
                          </button>
                        </div>
                      )}"""
    
    frontend_content = frontend_content.replace(dispatch_button_old, dispatch_button_new)

    # Also add the Print Invoice button for Dispatched orders so they can reprint it
    dispatched_status_old = """                        <span className={`inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${ord.status === 'Completed' ? 'bg-[#5cb85c] text-white border-[#4cae4c]' : ord.status === 'Dispatched' ? 'bg-[#5bc0de] text-white border-[#46b8da]' : ord.status === 'Accepted' ? 'bg-[#337ab7] text-white border-[#2e6da4]' : 'bg-gray-200 text-paa-gray-text border-gray-300'}`}>
                         {ord.status}
                       </span>"""
                       
    dispatched_status_new = """                        <div className="flex flex-col items-center gap-2">
                         <span className={`inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${ord.status === 'Completed' ? 'bg-[#5cb85c] text-white border-[#4cae4c]' : ord.status === 'Dispatched' ? 'bg-[#5bc0de] text-white border-[#46b8da]' : ord.status === 'Accepted' ? 'bg-[#337ab7] text-white border-[#2e6da4]' : ord.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-gray-200 text-paa-gray-text border-gray-300'}`}>
                           {ord.status}
                         </span>
                         {(ord.status === 'Accepted' || ord.status === 'Dispatched') && (
                           <button onClick={() => handlePrintInvoice(ord)} className="text-[9px] font-bold text-paa-navy underline tracking-widest uppercase">Print Label</button>
                         )}
                       </div>"""
    frontend_content = frontend_content.replace(dispatched_status_old, dispatched_status_new)

with open(frontend_file, "w", encoding="utf-8") as f:
    f.write(frontend_content)
    print("Frontend invoice patched")
