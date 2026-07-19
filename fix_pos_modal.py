import os

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\LivePosDashboard.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix 1: Make main container 100dvh
content = content.replace(
    'className="flex flex-col h-screen bg-gray-50 overflow-hidden fixed inset-0 z-[200]"',
    'className="flex flex-col h-[100dvh] bg-gray-50 overflow-hidden fixed inset-0 z-[200]"'
)

# Fix 2: Make modal full screen
old_modal_wrapper = """      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm md:max-w-md w-full overflow-hidden flex flex-col max-h-[95vh] animate-fade-in-up">
            <div className="bg-paa-navy text-white p-4 md:p-5 flex justify-between items-center shrink-0">
              <h2 className="font-serif font-bold text-xl md:text-2xl tracking-tight leading-tight">Complete Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-full"><ArrowLeft size={18} /></button>
            </div>"""

new_modal_wrapper = """      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-50 z-[300] flex flex-col h-[100dvh] w-full animate-fade-in-up">
            <div className="bg-paa-navy text-white p-5 md:p-6 flex justify-between items-center shrink-0 shadow-md">
              <h2 className="font-serif font-bold text-2xl tracking-tight leading-tight">Complete Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full"><X size={24} /></button>
            </div>"""

content = content.replace(old_modal_wrapper, new_modal_wrapper)

old_modal_content_start = """            <div className="p-5 md:p-8 flex-1 overflow-y-auto text-center space-y-6 md:space-y-8">"""
new_modal_content_start = """            <div className="p-6 md:p-10 flex-1 overflow-y-auto text-center flex flex-col items-center justify-center space-y-8 max-w-2xl mx-auto w-full">"""
content = content.replace(old_modal_content_start, new_modal_content_start)

# Fix: Ensure lucide-react imports X
if "ArrowLeft" in content and "X" not in content:
    content = content.replace("ArrowLeft,", "ArrowLeft, X,")

# The modal footer button width
old_footer = """              <div className="flex gap-3 pt-4 border-t">"""
new_footer = """              <div className="flex gap-3 pt-8 border-t w-full mt-auto">"""
content = content.replace(old_footer, new_footer)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("POS modal fixed.")
