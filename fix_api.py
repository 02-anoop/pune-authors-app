import os

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\server\routes\api.js"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_author_fetch = """    const authors = await prisma.author.findMany({
      include: { books: true, eventRegistrations: true }
    });
    const mapped = authors.map(a => ({
      ...a,
      joined: a.createdAt.toISOString().split('T')[0],
      totalBooks: a.books.length,
      eventsPart: a.eventRegistrations.length
    }));"""

new_author_fetch = """    const authors = await prisma.author.findMany({
      include: { books: true, eventRegistrations: true, eventAuthors: true }
    });
    const mapped = authors.map(a => ({
      ...a,
      joined: a.createdAt.toISOString().split('T')[0],
      totalBooks: a.books.length,
      eventsPart: a.eventRegistrations.length + a.eventAuthors.length,
      eventParticipation: a.eventAuthors.map(ea => ({
        ...ea,
        status: ea.optInStatus === 'Awaiting Approval' ? 'Pending' : ea.optInStatus
      }))
    }));"""

content = content.replace(old_author_fetch, new_author_fetch)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Backend API updated for pending event notifications.")
