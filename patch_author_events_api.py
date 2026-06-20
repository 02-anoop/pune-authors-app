import re

file_path = "c:/Users/arvin/Desktop/pune-authors-app/server/index.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Update the endpoint to include all Past Events
if "const pastEvents = await prisma.event.findMany" not in content:
    content = content.replace(
        "res.json({ eventInvites, books, listedBooks });",
        """const pastEvents = await prisma.event.findMany({ where: { status: 'Past' }, orderBy: { date: 'desc' } });
    res.json({ eventInvites, books, listedBooks, pastEvents });"""
    )

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
