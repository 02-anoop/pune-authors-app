import sys

def fix_file():
    with open('src/app/components/AuthorDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    target_status = """                                  statusText = 'Awaiting Data';
                                  statusColors = 'bg-blue-100 text-blue-700 border border-blue-200';"""
                      
    replacement_status = """                                  statusText = 'Completed';
                                  statusColors = 'bg-gray-100 text-gray-600 border border-gray-200';"""

    content = content.replace(target_status, replacement_status)
    
    # Also fix the message in the down arrow that says "Data Pending. Sales records have not been published yet."
    target_msg = """                                                <div className="text-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                                  <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                                  <p className="text-xs text-gray-500 font-medium">Data Pending. Sales records have not been published yet.</p>
                                               </div>"""
                                               
    replacement_msg = """                                                <div className="text-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                                  <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                                  <p className="text-xs text-gray-500 font-medium">Granular breakdown not available for this event.</p>
                                               </div>"""

    content = content.replace(target_msg, replacement_msg)

    with open('src/app/components/AuthorDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("SUCCESSFULLY UPDATED TEXTS")

if __name__ == '__main__':
    fix_file()
