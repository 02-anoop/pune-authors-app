import os

author_path = "src/app/components/AuthorDashboardPage.tsx"
with open(author_path, "r", encoding="utf-8") as f:
    author_content = f.read()

# 1. Start wrapper
target_start = """  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-6 border-b border-paa-navy/5 pb-4">"""
replace_start = """  return (
    <>
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-6 border-b border-paa-navy/5 pb-4">"""

if "<>\n    <div className=\"animate-fade-in-up\">" not in author_content:
    author_content = author_content.replace(target_start, replace_start)

# 2. End wrapper
target_end = """        </div>
      </div>
    </div>
  );
}"""
replace_end = """        </div>
      </div>
    </div>
    </>
  );
}"""

if "</>\n  );\n}" not in author_content:
    author_content = author_content.replace(target_end, replace_end)

with open(author_path, "w", encoding="utf-8") as f:
    f.write(author_content)
print("Fixed JSX wrapper in AuthorProfile")
