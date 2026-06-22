content = open(r'c:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx', encoding='utf-8').read()

old = '                 <button onClick={() => handleEditBookClick(book)} className="p-1.5 text-white bg-blue-500 hover:bg-blue-600 border border-[transparent] shadow" title="Edit Details">\n                          <Edit className="w-4 h-4" />\n                        </button>\n<button onClick={() => handleDeleteBook(book.id)} className="p-1.5 text-white bg-[#d9534f] hover:bg-[#c9302c] transition-colors shadow" title="Delete">\n                         <Trash2 className="w-4 h-4" />\n                       </button>\n                    </div>'

new = '                        <button onClick={() => handleEditBookClick(book)} className="p-1.5 text-white bg-blue-500 hover:bg-blue-600 border border-[transparent] shadow" title="Edit Details">\n                          <Edit className="w-4 h-4" />\n                        </button>\n                        <button onClick={() => handleDeleteBook(book.id)} className="p-1.5 text-white bg-[#d9534f] hover:bg-[#c9302c] transition-colors shadow" title="Delete">\n                          <Trash2 className="w-4 h-4" />\n                        </button>\n                     </div>'

if old in content:
    content = content.replace(old, new, 1)
    open(r'c:\Users\arvin\Desktop\pune-authors-app\src\app\components\OperationsDashboardPage.tsx', 'w', encoding='utf-8').write(content)
    print('DONE - indentation fixed')
else:
    print('NOT FOUND')
