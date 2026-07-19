import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/server/index.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_report_be = """    for (const authorId of authorsInvolved) {
       const authorBooks = eventBooks.filter(eb => eb.authorId === authorId);
       const hasSettled = authorBooks.every(eb => eb.listedStock === (eb.soldStock + eb.returnedStock));
       if (!hasSettled) {
          missingAuthors.push(authorBooks[0].author);
       }
    }
    
    if (missingAuthors.length > 0) {
       return res.json({ status: 'pending', missingAuthors });
    }
    
    res.json({ status: 'completed', data: eventBooks });"""

new_report_be = """    const settledEventBooks = [];
    for (const authorId of authorsInvolved) {
       const authorBooks = eventBooks.filter(eb => eb.authorId === authorId);
       const hasSettled = authorBooks.every(eb => eb.listedStock === (eb.soldStock + eb.returnedStock));
       if (!hasSettled) {
          missingAuthors.push(authorBooks[0].author);
       } else {
          settledEventBooks.push(...authorBooks);
       }
    }
    
    if (missingAuthors.length > 0) {
       return res.json({ status: 'pending', missingAuthors, data: settledEventBooks });
    }
    
    res.json({ status: 'completed', data: eventBooks });"""

if old_report_be in content:
    content = content.replace(old_report_be, new_report_be)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done backend")
