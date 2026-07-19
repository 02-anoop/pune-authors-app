import re
import sys

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "EventsDashboard" in line:
        print(f"Line {i+1}: {line.strip()}")
