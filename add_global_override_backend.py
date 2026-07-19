import os

file_path = r"C:\Users\arvin\Desktop\pune-authors-app\server\routes\api.js"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "const { booksData, registrationStatus, paymentStatus } = req.body;" in line:
        lines[i] = "    const { booksData, registrationStatus, paymentStatus, useGlobalOverride, globalSold, globalRevenue } = req.body;\n"
    if "optInStatus: registrationStatus === 'Participated' ? 'Opted-In' : 'Pending'" in line:
        lines[i] = "            optInStatus: registrationStatus === 'Participated' ? 'Opted-In' : 'Pending',\n            manualTotalSold: useGlobalOverride ? parseInt(globalSold) || 0 : null,\n            manualTotalRevenue: useGlobalOverride ? parseFloat(globalRevenue) || 0 : null\n"
    if "if (toCreate.length > 0) {" in line:
        lines[i] = "      if (toCreate.length > 0 && !useGlobalOverride) {\n"

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Updated backend for global override!")
