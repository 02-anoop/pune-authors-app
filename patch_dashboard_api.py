import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/server/index.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_res = "    res.json({ authorProfile, authorOrders, dynamicFields });"

new_res = """    const eventInvites = await prisma.eventAuthor.findMany({
      where: { authorId: authorProfile.id },
      include: { event: true }
    });
    const listedBooks = await prisma.eventBook.findMany({
      where: { authorId: authorProfile.id }
    });
    res.json({ authorProfile, authorOrders, dynamicFields, eventInvites, listedBooks });"""

if old_res in content:
    content = content.replace(old_res, new_res)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
