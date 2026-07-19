import os

file_path = r"c:\Users\arvin\Desktop\pune-authors-app\server\routes\api.js"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Modify dashboard-data to include posOrders
old_dashboard_fetch = """    const eventInvites = await prisma.eventAuthor.findMany({
      where: { authorId: authorProfile.id },
      include: { event: true }
    });
    const listedBooks = await prisma.eventBook.findMany({
      where: { authorId: authorProfile.id }
    });
    const result = { authorProfile, authorOrders, dynamicFields, eventInvites, listedBooks };"""

new_dashboard_fetch = """    const eventInvites = await prisma.eventAuthor.findMany({
      where: { authorId: authorProfile.id },
      include: { event: true }
    });
    const listedBooks = await prisma.eventBook.findMany({
      where: { authorId: authorProfile.id }
    });
    const posOrders = await prisma.posOrder.findMany({
      where: { authorId: authorProfile.id },
      include: { items: { include: { book: true } } }
    });
    const result = { authorProfile, authorOrders, dynamicFields, eventInvites, listedBooks, posOrders };"""

content = content.replace(old_dashboard_fetch, new_dashboard_fetch)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("dashboard-data updated to include posOrders.")
