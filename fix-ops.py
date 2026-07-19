import sys

def fix_ops():
    with open('src/app/components/OperationsDashboardPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    target = """                                                     <button onClick={() => {
                                                         handleEditAuthorData(authorData);"""

    replacement = """                                                     <button onClick={() => {
                                                         handleEditAuthorData(m);"""

    content = content.replace(target, replacement)

    with open('src/app/components/OperationsDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("SUCCESS")

if __name__ == '__main__':
    fix_ops()
