const fs = require('fs');
let content = fs.readFileSync('server/routes/api.js', 'utf8');

// Update /api/author/profile/bio
content = content.replace(
    'const { bio, phone, whatsapp, name, penName, city, state, instagram, facebook, address, aadharNumber, qualification, age, experience, skills, hobbies } = req.body;',
    'const { bio, phone, whatsapp, name, penName, city, state, instagram, facebook, address, aadharNumber, qualification, age, experience, skills, hobbies, whyJoining } = req.body;'
);
content = content.replace(
    '...(hobbies !== undefined && { hobbies }),',
    '...(hobbies !== undefined && { hobbies }),\n      ...(whyJoining !== undefined && { whyJoining }),'
);

// Update /api/author/books/:id
content = content.replace(
    'const { title, subtitle, genre, subGenre, mrp, stock, synopsis, pages, language, isbn, publisher, publicationDate, edition, format } = req.body;',
    'const { title, subtitle, genre, subGenre, mrp, stock, synopsis, pages, language, isbn, publisher, publicationDate, edition, format, printFormat } = req.body;'
);
// We need to add printFormat to the update payload for books/:id
content = content.replace(
    '...(format !== undefined && { format: format || null }),',
    '...(format !== undefined && { format: format || null }),\n        ...(printFormat !== undefined && { printFormat }),'
);

// We need to add overpriced recalculation
const recalcOverpriced = `
    let isOverpriced = false;
    if (pages && printFormat && mrp) {
        const rate = printFormat === 'Black & White' ? 1 : 3;
        const fairPrice = (parseInt(pages) * rate) + 100;
        isOverpriced = parseFloat(mrp) > fairPrice;
    }
`;
// Replace the updated block for /api/author/books/:id
const bookUpdateRegex = /const updated = await prisma\.book\.update\(\{\s*where: \{ id: bookId \},\s*data: \{/g;
content = content.replace(bookUpdateRegex, recalcOverpriced + '\n    const updated = await prisma.book.update({\n      where: { id: bookId },\n      data: {\n        ...(mrp !== undefined && pages !== undefined && printFormat !== undefined && { overpriced: isOverpriced }),');

// Update /api/author/books POST
content = content.replace(
    'const { title, subtitle, genre, subGenre, synopsis, pages, mrp, stock, overpriced, isOverpriced, language, isbn, publisher, publicationDate, edition, format } = req.body;',
    'const { title, subtitle, genre, subGenre, synopsis, pages, mrp, stock, overpriced, isOverpriced, language, isbn, publisher, publicationDate, edition, format, printFormat } = req.body;'
);

content = content.replace(
    'format: format || null,',
    'format: format || null,\n        printFormat: printFormat || null,'
);

fs.writeFileSync('server/routes/api.js', content);
console.log('Fixed backend API for author profile and book updates');
