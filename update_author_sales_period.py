import os
import re

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components\AuthorDashboardPage.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_filter_logic = """  const [reportPeriod, setReportPeriod] = useState('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const filterByDate = (date: Date) => {
    const now = new Date();
    if (reportPeriod === '7days') return date >= new Date(now.setDate(now.getDate() - 7));
    if (reportPeriod === '30days') return date >= new Date(now.setDate(now.getDate() - 30));
    if (reportPeriod === 'year') return date >= new Date(now.setFullYear(now.getFullYear() - 1));
    if (reportPeriod === 'custom') {
      if (!customStartDate || !customEndDate) return true;
      const s = new Date(customStartDate);
      const e = new Date(customEndDate);
      e.setHours(23, 59, 59, 999);
      return date >= s && date <= e;
    }
    return true; // lifetime
  };"""

new_filter_logic = """  const [reportPeriod, setReportPeriod] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const filterByDate = (date: Date) => {
    const now = new Date();
    if (reportPeriod === 'today') return date.toDateString() === now.toDateString();
    if (reportPeriod === 'week') return date >= new Date(now.setDate(now.getDate() - 7));
    if (reportPeriod === 'month') return date >= new Date(now.setDate(now.getDate() - 30));
    if (reportPeriod === 'custom') {
      if (!customStartDate || !customEndDate) return true;
      const s = new Date(customStartDate);
      const e = new Date(customEndDate);
      e.setHours(23, 59, 59, 999);
      return date >= s && date <= e;
    }
    return true; // lifetime
  };"""

content = content.replace(old_filter_logic, new_filter_logic)

old_buttons = """      <div className="flex items-center gap-3 mb-6 bg-gray-50 p-2 rounded-xl border border-gray-200 inline-flex flex-wrap">
        {['7days', '30days', 'year', 'lifetime', 'custom'].map(p => (
          <button key={p} onClick={() => setReportPeriod(p)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${reportPeriod === p ? 'bg-white shadow-sm text-paa-navy border border-gray-200' : 'text-gray-500 hover:text-paa-navy'}`}>
            {p === '7days' ? '7 Days' : p === '30days' ? '30 Days' : p === 'year' ? '1 Year' : p === 'lifetime' ? 'Lifetime' : 'Custom'}
          </button>
        ))}"""

new_buttons = """      <div className="flex items-center gap-3 mb-6 bg-gray-50 p-2 rounded-xl border border-gray-200 inline-flex flex-wrap">
        {['today', 'week', 'month', 'lifetime', 'custom'].map(p => (
          <button key={p} onClick={() => setReportPeriod(p)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${reportPeriod === p ? 'bg-white shadow-sm text-paa-navy border border-gray-200' : 'text-gray-500 hover:text-paa-navy'}`}>
            {p === 'today' ? 'Today' : p === 'week' ? 'Week' : p === 'month' ? 'Month' : p === 'lifetime' ? 'Lifetime' : 'Custom'}
          </button>
        ))}"""

content = content.replace(old_buttons, new_buttons)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Author Sales Report period toggles updated.")
