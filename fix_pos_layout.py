import os

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\LivePosDashboard.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the loading container wrapper
old_loading = """  if (loading) {
    return (
      <div className="flex flex-col h-[100dvh] bg-gray-50 overflow-hidden fixed inset-0 z-[200]">
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0 h-[72px]">"""
new_loading = """  if (loading) {
    return (
      <div className="flex flex-col bg-gray-50 overflow-hidden rounded-2xl border shadow-sm h-[calc(100vh-140px)] min-h-[600px] w-full">
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0 h-[72px]">"""
content = content.replace(old_loading, new_loading)

# Replace the main container wrapper
old_main = """  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 overflow-hidden fixed inset-0 z-[200]">
      {/* Header */}"""
new_main = """  return (
    <div className="flex flex-col bg-gray-50 overflow-hidden rounded-2xl border shadow-sm h-[calc(100vh-140px)] min-h-[600px] w-full">
      {/* Header */}"""
content = content.replace(old_main, new_main)

# Adjust the cart layout for smaller heights if needed, but it should be fine with h-[calc(100vh-140px)]
# Actually, the user said "also the charge customer button for that i have to scroll a bit"
# Let's verify the cart layout:
# <div className="p-6 bg-white border-t border-paa-navy/5 shrink-0 z-30">
# The parent is `<div className="... h-[45%] md:h-full flex flex-col shrink-0">`
# That should keep the footer fixed at the bottom of the container. 
# But wait, there is `<div className="flex-1 overflow-y-auto p-4 hide-scrollbar">` which forces the list to scroll!
# So the footer is already anchored. The only reason they had to scroll was because the `fixed inset-0` or `100dvh` was exceeding the viewport height due to the browser chrome on mobile, OR because it was rendering inside the dashboard wrapper without fixed inset-0, stretching the document body.

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("POS layout fixed.")
