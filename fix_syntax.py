import os

file_path = r'c:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# The lines we want to keep instead of 4611-4674 are exactly the completed Best Selling Book card + closing grid
correct_block = """            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider mb-1">Best Selling Book</div>
                <div className="text-sm font-bold text-purple-900 truncate" title={bestSellingBook || "-"}>{bestSellingBook || "-"}</div>
              </div>
              <div className="text-[9px] text-purple-400 font-medium mt-2 pt-2 border-t border-purple-200/50">auto-calculated</div>
            </div>
          </div>
"""

# Convert line numbers (1-indexed) to 0-indexed indices
start_idx = 4611 - 1
end_idx = 4674 - 1

# Replace lines [start_idx, end_idx] (inclusive) with correct_block
new_lines = lines[:start_idx] + [correct_block] + lines[end_idx+1:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Fixed OperationsDashboardPage.tsx syntax error by removing duplicated cards!")
