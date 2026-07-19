import os
import glob
import re

def redesign_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        c = f.read()

    # Cards and Depth
    c = c.replace('shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow duration-300', 
                  'shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ease-out')
    
    # Expand padding in cards
    c = c.replace('p-6 border', 'p-8 border')
    c = c.replace('px-6 py-4 border-b', 'px-8 py-6 z-10')

    # Typography Hierarchy
    c = c.replace('text-3xl font-serif font-medium', 'text-4xl font-serif font-semibold tracking-tight')
    
    # Remove old blocky colored headers from cards and replace with elegant typography
    # Match the exact pattern: <div className="bg-[#...] px-8 py-6 z-10 border-paa-navy/5 flex items-center justify-between">
    c = re.sub(r'bg-\[[^\]]+\] px-8 py-6 z-10 border-paa-navy/5', 'bg-white px-8 py-6 z-10', c)
    
    # Re-style those uppercase text-sm headers to elegant Serif H3s
    c = re.sub(r'text-sm font-bold tracking-widest uppercase text-paa-navy', 'text-2xl font-serif font-semibold text-paa-navy tracking-tight', c)

    # General radii increases
    c = c.replace('rounded-2xl', 'rounded-3xl')
    c = c.replace('rounded-xl', 'rounded-2xl')
    c = c.replace('rounded-lg', 'rounded-xl')

    # Modals / Overlays
    c = c.replace('bg-paa-navy/40 backdrop-blur-sm', 'bg-paa-navy/60 backdrop-blur-md')

    # Inputs
    c = c.replace('border border-paa-navy/10 rounded px-3 py-2', 'border border-paa-navy/10 rounded-2xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-paa-gold/20 focus:border-paa-gold transition-all duration-300')
    c = c.replace('border border-paa-navy/20 rounded px-3 py-2', 'border border-paa-navy/20 rounded-2xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-paa-gold/20 focus:border-paa-gold transition-all duration-300')

    # Sidebar/Navbar links active states
    c = c.replace('active:scale-95 transition-all duration-300', 'rounded-full active:scale-95 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(c)

for file in glob.glob('src/app/components/*.tsx'):
    redesign_file(file)
redesign_file('src/app/App.tsx')

print("Applied premium UI/UX design transformations.")
