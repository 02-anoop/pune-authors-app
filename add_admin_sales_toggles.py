import os
import re

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_select = """            <div className="flex-1 w-full">
              <label className="dash-label">Report Grouping Period</label>
              <select className="dash-input w-full" value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)}>
                <option value="daily">Daily (Group by Day)</option>
                <option value="weekly">Weekly (Group by Week)</option>
                <option value="monthly">Monthly (Group by Month)</option>
                <option value="yearly">Yearly (Group by Year)</option>
                <option value="lifelong">Lifelong (All Time)</option>
              </select>
            </div>"""

new_buttons = """            <div className="flex-1 w-full">
              <label className="dash-label mb-3 block">Report Grouping Period</label>
              <div className="flex flex-wrap gap-2">
                {['daily', 'weekly', 'monthly', 'yearly', 'lifelong'].map(period => (
                  <button
                    key={period}
                    onClick={() => setReportPeriod(period)}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all border ${
                      reportPeriod === period
                        ? 'bg-paa-navy text-white border-paa-navy shadow-md'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-paa-navy/30'
                    }`}
                  >
                    {period === 'lifelong' ? 'Lifetime' : period}
                  </button>
                ))}
              </div>
            </div>"""

content = content.replace(old_select, new_buttons)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Toggle buttons added to admin sales report.")
