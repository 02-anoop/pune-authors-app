import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf8') as f:
        content = f.read()

    # Add active state and transition to buttons
    content = re.sub(r'<button([^>]*)className="([^"]*)"', r'<button\1className="\2 active:scale-95 transition-all duration-300"', content)
    
    # Add fade-in animation to main dashboard views
    content = content.replace('className="min-h-screen bg-paa-cream', 'className="min-h-screen bg-paa-cream animate-fade-in-up')
    
    # Soften borders
    content = content.replace('border-paa-navy/10', 'border-paa-navy/5')

    # Round main containers
    content = content.replace('rounded', 'rounded-2xl')
    content = content.replace('rounded-2xl-full', 'rounded-full')
    content = content.replace('rounded-2xl-md', 'rounded-md')
    content = content.replace('rounded-2xl-lg', 'rounded-lg')
    content = content.replace('rounded-2xl-xl', 'rounded-xl')
    
    # Shadows
    content = content.replace('shadow-sm', 'shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow duration-300')
    
    # Glassmorphism
    content = content.replace('bg-black/50', 'bg-paa-navy/40 backdrop-blur-sm')
    content = content.replace('bg-black/60', 'bg-paa-navy/40 backdrop-blur-sm')

    # Colors
    content = content.replace('bg-[#ccffcc]', 'bg-[#e6f2eb]')
    content = content.replace('bg-[#b3d4ff]', 'bg-[#eef2f6]')
    content = content.replace('bg-[#ffcccc]', 'bg-[#fcedec]')
    content = content.replace('bg-[#e4ebf5]', 'bg-[#f0f4f8]')
    content = content.replace('bg-[#ffff99]', 'bg-[#fcf7e6]')

    with open(filepath, 'w', encoding='utf8') as f:
        f.write(content)

process_file('src/app/components/OperationsDashboardPage.tsx')
process_file('src/app/components/AuthorDashboardPage.tsx')
