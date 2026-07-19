async function test() {
  const res = await fetch('http://localhost:3001/api/orders/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '1234567890',
      address: 'Test Address',
      amount: 100,
      items: [{ bookId: 143, quantity: 2 }]
    })
  });
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Response:', text);
}
test();
