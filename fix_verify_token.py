with open('server/index.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find dynamic routes block
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if line.startswith('// --- DYNAMIC AUTHOR FIELDS ---'):
        start_idx = i
    if start_idx != -1 and line.startswith('const PORT ='):
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    dynamic_block = lines[start_idx:end_idx]
    # Remove from original place
    del lines[start_idx:end_idx]
    
    # Insert before app.listen
    listen_idx = -1
    for i, line in enumerate(lines):
        if line.startswith('app.listen(PORT'):
            listen_idx = i
            break
            
    if listen_idx != -1:
        lines = lines[:listen_idx] + dynamic_block + lines[listen_idx:]
    else:
        # Just append if not found
        lines = lines + dynamic_block
        
    with open('server/index.js', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Fixed verifyToken reference error by moving routes")
else:
    print("Could not find dynamic block")
