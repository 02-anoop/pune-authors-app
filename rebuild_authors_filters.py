
import re

with open("src/app/components/BrowseAuthorsPage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_genre = '<select\n            value={selectedGenre}\n            onChange={(e) => setSelectedGenre(e.target.value)}\n            style={{ padding: "0.8rem 1.5rem", border: "none", outline: "none", background: "transparent", fontSize: 14, color: C.dark, cursor: "pointer", fontWeight: 600 }}\n            className="filter-select"\n          >'
new_genre = '<select\n            value={selectedGenre}\n            onChange={(e) => setSelectedGenre(e.target.value)}\n            style={{ padding: "0.8rem 1.5rem", border: "none", outline: "none", background: C.dark, borderRadius: 50, fontSize: 14, color: C.white, cursor: "pointer", fontWeight: 600 }}\n            className="filter-select"\n          >'

old_city = '<select\n            value={selectedCity}\n            onChange={(e) => setSelectedCity(e.target.value)}\n            style={{ padding: "0.8rem 1.5rem", border: "none", outline: "none", background: "transparent", fontSize: 14, color: C.dark, cursor: "pointer", fontWeight: 600 }}\n            className="filter-select"\n          >'
new_city = '<select\n            value={selectedCity}\n            onChange={(e) => setSelectedCity(e.target.value)}\n            style={{ padding: "0.8rem 1.5rem", border: "none", outline: "none", background: C.gold, borderRadius: 50, fontSize: 14, color: C.white, cursor: "pointer", fontWeight: 600 }}\n            className="filter-select"\n          >'

content = content.replace(old_genre, new_genre)
content = content.replace(old_city, new_city)

with open("src/app/components/BrowseAuthorsPage.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Done")

