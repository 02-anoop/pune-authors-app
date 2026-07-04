const fs = require('fs');

const pastEvents = JSON.parse(fs.readFileSync('C:/Users/arvin/Desktop/pune-authors-app/src/app/components/data/past_events.json'));
const fiction = JSON.parse(fs.readFileSync('C:/Users/arvin/Desktop/pune-authors-app/src/app/components/data/fiction_catalogue.json'));
const nonFiction = JSON.parse(fs.readFileSync('C:/Users/arvin/Desktop/pune-authors-app/src/app/components/data/non_fiction_catalogue.json'));

const allBooks = [...fiction, ...nonFiction];

let csv = 'Event ID,Event Name,Location,Date,Author Name,Book Title,Copies Sent,Manual Sold,Returned,Revenue,POS Sold,POS Revenue\n';

pastEvents.forEach(evt => {
  // Pick a random number of authors from 1 to 5 to simulate data for this event
  const numAuthors = Math.min(evt.authorsParticipated || 1, 5);
  for (let i = 0; i < numAuthors; i++) {
    const randomBook = allBooks[Math.floor(Math.random() * allBooks.length)];
    const copiesSent = Math.floor(Math.random() * 50) + 10;
    const manualSold = Math.floor(Math.random() * copiesSent);
    const returned = copiesSent - manualSold;
    const revenue = manualSold * (randomBook.price || 200);

    csv += `${evt.id},"${evt.name}","${evt.address}","${evt.date}","${randomBook.author}","${randomBook.title.replace(/"/g, '')}",${copiesSent},${manualSold},${returned},${revenue},0,0\n`;
  }
});

fs.writeFileSync('C:/Users/arvin/Desktop/pune-authors-app/past_events_author_data.csv', csv);
console.log('CSV created at C:/Users/arvin/Desktop/pune-authors-app/past_events_author_data.csv');
