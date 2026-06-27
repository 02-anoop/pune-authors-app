import os

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\LivePosDashboard.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace massive buttons in the modal with standard dash-btn
old_cancel_btn = """                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="w-1/3 py-4 bg-gray-200 text-gray-700 font-bold uppercase tracking-widest rounded hover:bg-gray-300 transition-colors shadow-sm"
                >
                  Cancel
                </button>"""
new_cancel_btn = """                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="dash-btn dash-btn-ghost w-1/3 justify-center border-gray-300 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>"""
content = content.replace(old_cancel_btn, new_cancel_btn)

old_confirm_btn = """                <button 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="flex-1 bg-paa-navy text-paa-cream py-4 rounded font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-paa-gold hover:text-paa-navy transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isProcessing ? 'Processing...' : <><CheckCircle size={18} /> Payment Received</>}
                </button>"""
new_confirm_btn = """                <button 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="dash-btn dash-btn-primary flex-1 justify-center disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : <><CheckCircle size={14} /> Payment Received</>}
                </button>"""
content = content.replace(old_confirm_btn, new_confirm_btn)

# Make Complete Payment header serif to match the rest of the app's premium feel
content = content.replace(
    '<h2 className="font-bold uppercase tracking-widest text-sm md:text-base">Complete Payment</h2>',
    '<h2 className="font-serif font-bold text-xl md:text-2xl tracking-tight leading-tight">Complete Payment</h2>'
)

# And Day Summary header
content = content.replace(
    '<h2 className="font-bold uppercase tracking-widest">Day Summary</h2>',
    '<h2 className="font-serif font-bold text-xl tracking-tight">Day Summary</h2>'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("POS UI polished.")
