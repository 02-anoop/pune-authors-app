content = open(r'c:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx', encoding='utf-8').read()

# Find position of handleDeleteBook in the actions td
idx = content.find('handleDeleteBook(book.id)')
if idx == -1:
    print('ERROR: handleDeleteBook not found')
else:
    # Check if edit button already added
    if 'handleEditBookClick(book)' in content:
        print('Edit button already present!')
    else:
        # Insert edit button before the delete button line
        # Find the start of the delete button line (go back to the <button)
        delete_btn_start = content.rfind('<button', 0, idx)
        insert_pos = delete_btn_start

        edit_btn = """                        <button onClick={() => handleEditBookClick(book)} className="p-1.5 text-white bg-blue-500 hover:bg-blue-600 border border-[transparent] shadow" title="Edit Details">
                          <Edit className="w-4 h-4" />
                        </button>
"""
        # Detect line ending from content
        if '\r\n' in content:
            edit_btn = edit_btn.replace('\n', '\r\n')

        content = content[:insert_pos] + edit_btn + content[insert_pos:]
        open(r'c:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx', 'w', encoding='utf-8').write(content)
        print('DONE - edit button added successfully')
