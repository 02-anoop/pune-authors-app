import os

ops_path = r"C:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx"
with open(ops_path, 'r', encoding='utf-8') as f:
    ops_data = f.read()

# Add download function
download_func = """    const handleDownloadEventReport = () => {
        if (!selectedEventBreakdown) return;
        let csv = 'Author Name,Total Books Listed,Total Books Sold,Total Revenue (INR)\\n';
        authors.forEach((a: any) => {
            const listed = a.books?.reduce((s:number, b:any) => s + (b.listedStock || 0), 0) || 0;
            const sold = a.books?.reduce((s:number, b:any) => s + (b.soldStock || 0), 0) || 0;
            const rev = a.books?.reduce((s:number, b:any) => s + ((b.soldStock || 0) * (b.book?.mrp || 0)), 0) || 0;
            csv += `"${a.name}",${listed},${sold},${rev}\\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Event_Report_${selectedEventBreakdown.name.replace(/\\s+/g, '_')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    if (selectedEventBreakdown) {"""

ops_data = ops_data.replace("if (selectedEventBreakdown) {", download_func)

# Add the button to the header
header_btn_find = """                 <button onClick={() => {
                     if (selectedAuthorForData) {"""

header_btn_replace = """                 <div className="flex gap-2">
                   {!selectedAuthorForData && (
                     <button onClick={handleDownloadEventReport} className="dash-btn bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-sm font-bold flex items-center gap-2">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> Download Report
                     </button>
                   )}
                   <button onClick={() => {
                     if (selectedAuthorForData) {"""

ops_data = ops_data.replace(header_btn_find, header_btn_replace)

with open(ops_path, 'w', encoding='utf-8') as f:
    f.write(ops_data)

print("Added download report button!")
