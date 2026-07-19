const fs = require('fs');
const path = 'c:/Users/arvin/Desktop/pune-authors-app/src/app/components/CataloguePage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Ensure we don't duplicate
if (!content.includes('authorsParam')) {
  content = content.replace(
    /const \[searchQuery, setSearchQuery\] = useState\(""\);/,
    `const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pdf = params.get('pdf');
    const authorsParam = params.get('authors');
    if (pdf === 'true') {
        setTimeout(() => {
           if (authorsParam) {
               const checkBooks = setInterval(() => {
                   if (document.querySelectorAll('.book-card').length > 0) {
                      clearInterval(checkBooks);
                      setTimeout(() => generatePDF(), 1000);
                   }
               }, 500);
           } else {
               setTimeout(() => generatePDF(), 2000);
           }
        }, 1000);
    }
  }, []);
`
  );

  content = content.replace(
    /const filteredBooks = useMemo\(\(\) => \{/,
    `const filteredBooks = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const authorsParam = params.get('authors');
    let baseAllBooks = allBooks;
    if (authorsParam) {
        const ids = authorsParam.split(',').map(Number);
        baseAllBooks = allBooks.filter((b: any) => ids.includes(b.authorId));
    }`
  );

  content = content.replace(
    /let result = allBooks;/g,
    `let result = baseAllBooks;`
  );

  fs.writeFileSync(path, content, 'utf8');
  console.log('Success Catalogue Patch');
} else {
  console.log('Already patched');
}
