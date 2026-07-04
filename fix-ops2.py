import sys

def fix_ops():
    with open('src/app/components/OperationsDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    target1 = """                                   <input type="number" value={book.listedStock} onChange={(e) => {
                                      const newBooks = [...manageAuthorBooks];
                                      newBooks[idx].listedStock = parseInt(e.target.value) || 0;
                                      if (newBooks[idx].listedStock > 0 && newBooks[idx].soldStock > 0) newBooks[idx].returnedStock = Math.max(0, newBooks[idx].listedStock - newBooks[idx].soldStock);
                                      setManageAuthorBooks(newBooks);"""

    replace1 = """                                   <input type="number" value={book.listedStock} onChange={(e) => {
                                      const newBooks = [...manageAuthorBooks];
                                      newBooks[idx].listedStock = parseInt(e.target.value) || 0;
                                      if (newBooks[idx].listedStock > 0) newBooks[idx].isSelected = true;
                                      if (newBooks[idx].listedStock > 0 && newBooks[idx].soldStock > 0) newBooks[idx].returnedStock = Math.max(0, newBooks[idx].listedStock - newBooks[idx].soldStock);
                                      setManageAuthorBooks(newBooks);"""

    target2 = """                                   <input type="number" value={book.soldStock} onChange={(e) => {
                                      const newBooks = [...manageAuthorBooks];
                                      newBooks[idx].soldStock = parseInt(e.target.value) || 0;
                                      if (newBooks[idx].listedStock > 0 && newBooks[idx].soldStock > 0) newBooks[idx].returnedStock = Math.max(0, newBooks[idx].listedStock - newBooks[idx].soldStock);
                                      setManageAuthorBooks(newBooks);"""

    replace2 = """                                   <input type="number" value={book.soldStock} onChange={(e) => {
                                      const newBooks = [...manageAuthorBooks];
                                      newBooks[idx].soldStock = parseInt(e.target.value) || 0;
                                      if (newBooks[idx].soldStock > 0) newBooks[idx].isSelected = true;
                                      if (newBooks[idx].listedStock > 0 && newBooks[idx].soldStock > 0) newBooks[idx].returnedStock = Math.max(0, newBooks[idx].listedStock - newBooks[idx].soldStock);
                                      setManageAuthorBooks(newBooks);"""

    content = content.replace(target1, replace1).replace(target2, replace2)

    with open('src/app/components/OperationsDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("SUCCESS")

if __name__ == '__main__':
    fix_ops()
