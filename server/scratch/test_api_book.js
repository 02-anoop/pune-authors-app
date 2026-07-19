const axios = require('axios');

async function main() {
  try {
    const res = await axios.get('http://localhost:3001/api/books/172');
    console.log("Status:", res.status);
    console.log("Book Title:", res.data.title);
    console.log("Author Name:", res.data.author.name);
    console.log("Author extraData type:", typeof res.data.author.extraData);
    console.log("Author extraData keys:", Object.keys(res.data.author.extraData || {}).slice(0, 10));
    console.log("Author extraData values:", Object.keys(res.data.author.extraData || {}).slice(0, 10).map(k => res.data.author.extraData[k]));
  } catch(e) {
    console.error("Request failed:", e.message);
  }
}

main();
