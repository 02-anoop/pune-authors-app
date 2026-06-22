content = open(r'c:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx', encoding='utf-8').read()

# Fix the malformed indentation around edit and delete buttons
old_fragment = content[content.find('handleEditBookClick(book)') - 40 : content.find('handleDeleteBook(book.id)') + 250]
print("FOUND FRAGMENT:")
print(repr(old_fragment))
