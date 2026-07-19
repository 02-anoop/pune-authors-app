import re
import sys

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Tab" in line and ("Event" in line or "Author" in line):
        print(f"Line {i+1}: {line.strip()}")
