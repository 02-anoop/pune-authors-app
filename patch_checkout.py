import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/CheckoutPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix the cartIds mapping
if ".map(Number)" not in content:
    content = content.replace(
        "const cartIds: number[] = location.state?.cart || [1];",
        "const cartIds: number[] = (location.state?.cart || [1]).map(Number);"
    )

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("CheckoutPage patched")
