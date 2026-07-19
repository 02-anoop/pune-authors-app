import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/src/app/components/OperationsDashboardPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update fetchEventReport to not use random data
old_fetch = """      // Generate highly detailed mock report data for legacy events
      const mockData = [];
      const numAuthors = legacyEvt.authorsParticipated || 5;
      const totalBooks = legacyEvt.booksSold || 20;
      let booksLeft = totalBooks;
      
      for (let i = 0; i < numAuthors; i++) {
         const sold = i === numAuthors - 1 ? booksLeft : Math.floor(Math.random() * (booksLeft / 2)) + 1;
         booksLeft -= sold;
         mockData.push({
            id: 'legacy_row_' + i,
            author: { name: `Author ${String.fromCharCode(65 + i)} (Legacy Record)` },
            book: { title: `Legacy Book ${i + 1}`, mrp: 250 },
            listedStock: sold + Math.floor(Math.random() * 5),
            soldStock: sold,
            returnedStock: 0,
         });
      }
      setEventReportData(mockData);"""

new_fetch = """      // Only show existing data for legacy events
      setEventReportData([{
         isLegacySummary: true,
         authorsParticipated: legacyEvt.authorsParticipated || 0,
         booksSold: legacyEvt.booksSold || 0
      }]);"""

content = content.replace(old_fetch, new_fetch)

# 2. Update Modal JSX to handle isLegacySummary
old_modal_content = """            <div className="p-6 overflow-y-auto flex-1">
               {eventReportData.length === 0 ? ("""

new_modal_content = """            <div className="p-6 overflow-y-auto flex-1">
               {eventReportData[0]?.isLegacySummary ? (
                  <div className="text-center p-8 bg-gray-50 border border-paa-navy/10 rounded">
                     <h3 className="text-2xl font-serif text-paa-navy mb-2">Legacy Event Overview</h3>
                     <p className="text-sm text-gray-500 mb-8">Granular transaction records are not available for this archived event.</p>
                     <div className="flex justify-center gap-12">
                        <div className="bg-white p-6 shadow-sm border border-gray-100 rounded min-w-[150px]">
                           <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Total Authors</p>
                           <p className="text-4xl font-black text-paa-navy">{eventReportData[0].authorsParticipated}</p>
                        </div>
                        <div className="bg-white p-6 shadow-sm border border-gray-100 rounded min-w-[150px]">
                           <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Books Sold</p>
                           <p className="text-4xl font-black text-paa-navy">{eventReportData[0].booksSold}</p>
                        </div>
                     </div>
                  </div>
               ) : eventReportData.length === 0 ? ("""

content = content.replace(old_modal_content, new_modal_content)

# 3. Disable the total revenue footer if it's a legacy summary
old_footer = """            {eventReportData.length > 0 && ("""
new_footer = """            {eventReportData.length > 0 && !eventReportData[0]?.isLegacySummary && ("""

content = content.replace(old_footer, new_footer)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
