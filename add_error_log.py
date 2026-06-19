with open('server/index.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_catch = '''    res.status(201).json(author);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});'''

new_catch = '''    res.status(201).json(author);
  } catch (error) {
    console.error(error);
    require('fs').writeFileSync('last_error.log', error.stack || error.toString());
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});'''

content = content.replace(old_catch, new_catch)

with open('server/index.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated register catch block to write last_error.log")
