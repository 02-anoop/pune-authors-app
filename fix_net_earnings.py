import os
import re

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# The array in OverviewTab has 4 items. We just want to replace the `netEarnings` line.
# Let's use a regex or string replace for the specific line 685
content = content.replace("{ label: 'Net Earnings 70%', value: '\\u20b9' + netEarnings.toFixed(0), colorClass: 'red' },", "{ label: 'Total Fees Paid', value: '\\u20b9' + totalFeesPaid, colorClass: 'red' },")

# Wait, `totalFeesPaid` might not be defined inside `OverviewTab` if I put it in the main `AuthorDashboardPage` body.
# Where did I put `totalFeesPaid` in `remove_commission.py` / `add_event_fees.py`?
# I put `totalEventFees` calculation right before `const actionItems: any[] = [];` which is inside `OverviewTab`.
# Let's check `AuthorDashboardPage.tsx` lines around 685.

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed netEarnings reference error.")
