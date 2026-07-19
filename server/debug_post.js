const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const http = require('http');

async function test() {
  const author = await prisma.author.findFirst({ include: { books: true } });
  const event = await prisma.event.findFirst();
  const token = jwt.sign({ email: author.email, role: 'AUTHOR' }, 'supersecret', { expiresIn: '1h' });
  
  const books = author.books.length > 0 ? [{bookId: author.books[0].id.toString(), title: author.books[0].title, stock: 1, included: true}] : [];
  
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  let body = '';
  body += '--' + boundary + '\r\n';
  body += 'Content-Disposition: form-data; name="transactionId"\r\n\r\nTEST_TRANS\r\n';
  body += '--' + boundary + '\r\n';
  body += 'Content-Disposition: form-data; name="booksToLink"\r\n\r\n' + JSON.stringify(books) + '\r\n';
  body += '--' + boundary + '\r\n';
  body += 'Content-Disposition: form-data; name="paymentScreenshot"; filename="test.jpg"\r\nContent-Type: image/jpeg\r\n\r\ndummy\r\n';
  body += '--' + boundary + '--\r\n';

  const req = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/author/events/' + event.id + '/opt-in',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Length': Buffer.byteLength(body)
    }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => console.log('Response:', res.statusCode, data));
  });
  req.on('error', console.error);
  req.write(body);
  req.end();
}
test().catch(console.error);
