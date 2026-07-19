const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

function parseMrp(s) {
  if (!s || s === 'Not specified') return 0;
  const m = String(s).match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

async function seed() {
  try {
    const fictionPath = path.join(
      __dirname,
      '../src/app/components/data/fiction_catalogue.json'
    );

    const nonFictionPath = path.join(
      __dirname,
      '../src/app/components/data/non_fiction_catalogue.json'
    );

    console.log('\n========== FILES ==========');
    console.log('Fiction Path:', fictionPath);
    console.log('Non-Fiction Path:', nonFictionPath);

    const fictionData = JSON.parse(
      fs.readFileSync(fictionPath, 'utf8')
    );

    const nonFictionData = JSON.parse(
      fs.readFileSync(nonFictionPath, 'utf8')
    );

    console.log('\n========== JSON STATS ==========');
    console.log(
      'Fiction Authors:',
      fictionData?.fiction_catalogue?.length || 0
    );
    console.log(
      'Non-Fiction Authors:',
      nonFictionData?.non_fiction_catalogue?.length || 0
    );

    const allEntries = [
      ...(fictionData.fiction_catalogue || []).map(e => ({
        ...e,
        genre: 'Fiction'
      })),
      ...(nonFictionData.non_fiction_catalogue || []).map(e => ({
        ...e,
        genre: 'Non-Fiction'
      }))
    ];

    console.log('Total Author Entries:', allEntries.length);

    let totalBooksFound = 0;

    allEntries.forEach(entry => {
      totalBooksFound += Array.isArray(entry.books)
        ? entry.books.length
        : 0;
    });

    console.log('Total Books Found:', totalBooksFound);

    let added = 0;
    let skipped = 0;
    let errors = 0;

    for (const entry of allEntries) {
      console.log(`\nAuthor: ${entry.author}`);

      let author = await prisma.author.findFirst({
        where: {
          name: entry.author
        }
      });

      if (!author) {
        author = await prisma.author.create({
          data: {
            name: entry.author,
            email: `${entry.author
              .toLowerCase()
              .replace(/\s+/g, '.')}` + '@paa.placeholder',
            phone: '0000000000',
            bio: entry.bio || '',
            status: 'Approved'
          }
        });

        console.log(`Created author: ${author.name}`);
      }

      if (!Array.isArray(entry.books)) {
        console.log('No books array found.');
        continue;
      }

      for (const book of entry.books) {
        try {
          const existing = await prisma.book.findFirst({
            where: {
              title: book.title,
              authorId: author.id
            }
          });

          if (existing) {
            console.log(`Skipped: ${book.title}`);
            skipped++;
            continue;
          }

          await prisma.book.create({
            data: {
              title: book.title || 'Untitled',
              genre: entry.genre,
              subGenre: book.subGenre || null,
              synopsis: book.description || '',
              mrp: parseMrp(book.mrp),
              coverUrl: book.cover_image_url || null,
              status: 'Approved',
              authorId: author.id,
              stock: 0
            }
          });

          console.log(
            `Added: ${book.title} | ${entry.author}`
          );

          added++;
        } catch (err) {
          errors++;
          console.error(
            `Error adding "${book.title}" by ${entry.author}`
          );
          console.error(err.message);
        }
      }
    }

    console.log('\n========== SUMMARY ==========');
    console.log('Books Found :', totalBooksFound);
    console.log('Added       :', added);
    console.log('Skipped     :', skipped);
    console.log('Errors      :', errors);
  } catch (err) {
    console.error('\nFATAL ERROR');
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();