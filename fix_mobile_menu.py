import os
import re

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Make the mobile menu truly mobile friendly
old_sidebar = """<div className={`author-profile-sidebar w-full md:w-[240px] p-4 flex-col gap-2 md:sticky md:top-[80px] h-fit bg-white border border-paa-navy/5 shadow-premium transition-all duration-500 ease-out z-[500] ${isMobileMenuOpen ? 'flex absolute top-4 left-4 right-4 md:static shadow-2xl' : 'hidden md:flex'}`}>"""
new_sidebar = """<div className={`author-profile-sidebar w-full md:w-[240px] p-4 flex-col gap-2 md:sticky md:top-[80px] h-fit bg-white border border-paa-navy/5 shadow-premium transition-all duration-500 ease-out z-[500] ${isMobileMenuOpen ? 'flex fixed inset-0 top-[80px] z-[500] bg-white md:static md:shadow-premium' : 'hidden md:flex'}`}>"""

content = content.replace(old_sidebar, new_sidebar)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Author dashboard mobile menu fixed.")
