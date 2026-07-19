import os

checkout_path = "src/app/components/CheckoutPage.tsx"
with open(checkout_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add currentAuthorIndex
if "const [currentAuthorIndex, setCurrentAuthorIndex] = useState(0);" not in content:
    content = content.replace("const [uploading, setUploading] = useState(false);", "const [uploading, setUploading] = useState(false);\n  const [currentAuthorIndex, setCurrentAuthorIndex] = useState(0);")

# 2. Add Author Groups and Bundle Logic
group_logic_target = "const totalAmount = books.reduce((acc, book) => acc + ((book.mrp || 428) * (quantities[book.id] || 1)), 0);"
group_logic_replace = """
  const authorGroups = useMemo(() => {
    const groups: Record<number, any[]> = {};
    books.forEach(b => {
      const aId = b.author?.id || 0;
      if (!groups[aId]) groups[aId] = [];
      groups[aId].push(b);
    });
    return Object.values(groups);
  }, [books]);

  const currentGroupBooks = authorGroups[currentAuthorIndex] || [];
  const currentAuthor = currentGroupBooks.length > 0 ? currentGroupBooks[0].author : null;
  const currentGroupQty = currentGroupBooks.reduce((acc, b) => acc + (quantities[b.id] || 1), 0);
  
  // Phase 6, Task 9: Bundle Offers - Buy 3 get Rs 50 off dynamically in checkout
  const bundleDiscount = currentGroupQty >= 3 ? 50 : 0; 
  
  const currentSubtotal = currentGroupBooks.reduce((acc, book) => acc + ((book.mrp || 428) * (quantities[book.id] || 1)), 0);
  const totalAmount = currentSubtotal - bundleDiscount;
"""
if "const authorGroups = useMemo(() => {" not in content:
    content = content.replace(group_logic_target, group_logic_replace)

# 3. Update handlePay to use currentGroupBooks and increment index
handle_pay_target = """      const itemsPayload = books.map(book => ({
        bookId: book.id,
        quantity: quantities[book.id] || 1
      }));"""
handle_pay_replace = """      const itemsPayload = currentGroupBooks.map((book: any) => ({
        bookId: book.id,
        quantity: quantities[book.id] || 1
      }));"""
if "currentGroupBooks.map((book: any) => ({" not in content:
    content = content.replace(handle_pay_target, handle_pay_replace)

handle_pay_done_target = """      setUploading(false);
      setPaymentDone(true);"""
handle_pay_done_replace = """      setUploading(false);
      setPaymentFile(null);
      setTransactionId("");
      
      if (currentAuthorIndex + 1 < authorGroups.length) {
        setCurrentAuthorIndex(prev => prev + 1);
        alert(`Payment for ${currentAuthor?.name || 'Author'} complete. Proceeding to next author.`);
      } else {
        setPaymentDone(true);
      }"""
if "setCurrentAuthorIndex(prev => prev + 1);" not in content:
    content = content.replace(handle_pay_done_target, handle_pay_done_replace)

# 4. Update the UI to show currentAuthor context and bundle discounts
ui_summary_target = """                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#1a1a2e", marginBottom: "1.25rem" }}>Order Summary</h3>
                <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: "1.25rem", marginBottom: "1.5rem" }}>
                  {books.map(book => ("""
ui_summary_replace = """                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#1a1a2e", marginBottom: "1.25rem" }}>
                  Order Summary ({currentAuthorIndex + 1} of {authorGroups.length})
                </h3>
                <p style={{fontSize: 13, color: "#2563eb", marginBottom: "1rem", fontWeight: 600}}>Items by: {currentAuthor?.name}</p>
                
                {bundleDiscount > 0 && (
                   <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "0.75rem", borderRadius: 8, marginBottom: "1rem", fontSize: 13, fontWeight: 700, border: "1px solid #bbf7d0" }}>
                      🎉 Bundle Offer Applied: Buy 3+ Books, Get ₹50 Off!
                   </div>
                )}
                <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: "1.25rem", marginBottom: "1.5rem" }}>
                  {currentGroupBooks.map((book: any) => ("""
if "Order Summary ({currentAuthorIndex + 1}" not in content:
    content = content.replace(ui_summary_target, ui_summary_replace)

# Fix map param
if "book => (" in content and "currentGroupBooks.map(" in content:
    content = content.replace("book => (", "(book: any) => (")

# Update payment QR UI
ui_payment_qr_target = "{books.length > 0 && books[0].author?.qrCodeUrl ? ("
ui_payment_qr_replace = "{currentAuthor?.qrCodeUrl ? ("
if "{currentAuthor?.qrCodeUrl ? (" not in content:
    content = content.replace(ui_payment_qr_target, ui_payment_qr_replace)

ui_payment_qr_img_target = "src={books[0].author.qrCodeUrl.startsWith('http') ? books[0].author.qrCodeUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${books[0].author.qrCodeUrl}`}"
ui_payment_qr_img_replace = "src={currentAuthor.qrCodeUrl.startsWith('http') ? currentAuthor.qrCodeUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${currentAuthor.qrCodeUrl}`}"
if "currentAuthor.qrCodeUrl.startsWith" not in content:
    content = content.replace(ui_payment_qr_img_target, ui_payment_qr_img_replace)

ui_pay_btn_target = "{uploading ? \"Processing...\" : \"Place Order\"}"
ui_pay_btn_replace = "{uploading ? \"Processing...\" : `Pay & Continue (${currentAuthorIndex + 1}/${authorGroups.length})`}"
if "Pay & Continue" not in content:
    content = content.replace(ui_pay_btn_target, ui_pay_btn_replace)


with open(checkout_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Checkout Phase 6 patched")
