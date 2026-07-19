with open('server/index.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_catch = '''    res.status(201).json(author);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});'''

new_catch = '''    res.status(201).json(author);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});'''

content = content.replace(old_catch, new_catch)

old_body = '''    const { name, email, phone, password, bio, title, genre, synopsis, pages, mrp, whatsapp, transactionId } = req.body;'''
new_body = '''    const { name, email, phone, password, bio, title, genre, synopsis, pages, mrp, whatsapp, transactionId, stock } = req.body;'''
content = content.replace(old_body, new_body)

old_books = '''        books: {
          create: {
            title,
            genre,
            synopsis,
            pages: parseInt(pages) || null,
            mrp: parseFloat(mrp),
            coverUrl,
            status: 'Pending'
          }
        }'''

new_books = '''        books: {
          create: {
            title,
            genre,
            synopsis,
            pages: parseInt(pages) || null,
            mrp: parseFloat(mrp),
            stock: parseInt(stock) || 0,
            coverUrl,
            status: 'Pending'
          }
        }'''

content = content.replace(old_books, new_books)

with open('server/index.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated register route to handle stock and return error details")
