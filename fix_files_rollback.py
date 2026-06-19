with open('server/index.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_files = '''    // In local dev, store local URL. In prod, this would be an S3 URL.
    const photoUrl = req.files['photo'] ? `/uploads/${req.files['photo'][0].filename}` : null;
    const coverUrl = req.files['cover'] ? `/uploads/${req.files['cover'][0].filename}` : null;
    const paymentScreenshotUrl = req.files['paymentScreenshot'] ? `/uploads/${req.files['paymentScreenshot'][0].filename}` : null;'''

new_files = '''    // In local dev, store local URL. In prod, this would be an S3 URL.
    const files = req.files || {};
    const photoUrl = files['photo'] ? `/uploads/${files['photo'][0].filename}` : null;
    const coverUrl = files['cover'] ? `/uploads/${files['cover'][0].filename}` : null;
    const paymentScreenshotUrl = files['paymentScreenshot'] ? `/uploads/${files['paymentScreenshot'][0].filename}` : null;'''

content = content.replace(old_files, new_files)

# Handle existingUser returning an error instead of crashing if it's partly registered
# If a User exists but Author doesn't, we should delete the User to let them retry? Or just say email taken.
# But it's in a transaction, wait, no it's not a transaction!
# If User is created, but Author fails, next time they'll get Email Taken. We should use a transaction or rollback!
old_create = '''    // Create login user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'AUTHOR' }
    });

      const author = await prisma.author.create({'''

new_create = '''    // Create login user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'AUTHOR' }
    });

    let author;
    try {
      author = await prisma.author.create({'''

old_create_end = '''      },
      include: { books: true }
    });

    res.status(201).json(author);'''

new_create_end = '''      },
      include: { books: true }
    });
    } catch (dbError) {
      // Rollback user if author fails
      await prisma.user.delete({ where: { email } });
      throw dbError;
    }

    res.status(201).json(author);'''

content = content.replace(old_create, new_create)
content = content.replace(old_create_end, new_create_end)

with open('server/index.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated req.files and rollback in register route")
