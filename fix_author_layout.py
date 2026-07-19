import os

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix 1: Make Sidebar high z-index on desktop so it stays above modals
old_sidebar = """<div className={`author-profile-sidebar w-full md:w-[240px] p-4 flex-col gap-2 md:sticky md:top-[80px] h-fit bg-white border border-paa-navy/5 shadow-premium transition-all duration-500 ease-out z-20 md:z-0 ${isMobileMenuOpen ? 'flex absolute top-4 left-4 right-4 md:static shadow-2xl' : 'hidden md:flex'}`}>"""
new_sidebar = """<div className={`author-profile-sidebar w-full md:w-[240px] p-4 flex-col gap-2 md:sticky md:top-[80px] h-fit bg-white border border-paa-navy/5 shadow-premium transition-all duration-500 ease-out z-[500] ${isMobileMenuOpen ? 'flex absolute top-4 left-4 right-4 md:static shadow-2xl' : 'hidden md:flex'}`}>"""
content = content.replace(old_sidebar, new_sidebar)

# Fix 2: Remove hover transform from flex-1 container to stop modal glitching
old_flex_container = """<div className="flex-1 bg-white border border-paa-navy/5 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out p-6 md:p-8">"""
new_flex_container = """<div className="flex-1 bg-white border border-paa-navy/5 shadow-premium p-6 md:p-8 min-h-[calc(100vh-160px)] relative">"""
content = content.replace(old_flex_container, new_flex_container)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Author dashboard layout glitch fixed.")
