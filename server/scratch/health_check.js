const http = require('http');

// ------- CONFIG -------
const BASE_URL = 'http://localhost:3001';
const ADMIN_EMAIL = 'admin@puneauthors.com'; // change if needed
const ADMIN_PASS = 'admin123';               // change if needed
// ----------------------

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port || 3001,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(data && { 'Content-Length': Buffer.byteLength(data) })
      }
    };
    const req = http.request(options, res => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runChecks() {
  console.log('\n========== BACKEND HEALTH CHECK ==========\n');
  console.log(`Target: ${BASE_URL}\n`);

  // 1. Public stats (no auth)
  try {
    const r = await request('GET', '/api/public-stats');
    if (r.status === 200) {
      console.log('✅ Public Stats: OK');
      console.log('   Authors:', r.body.authors, '| Books:', r.body.books, '| Libraries:', r.body.airportLibraries);
    } else {
      console.log(`❌ Public Stats: ${r.status}`, r.body);
    }
  } catch(e) { console.log('❌ Public Stats: SERVER NOT RUNNING -', e.code); process.exit(1); }

  // 2. Books endpoint (no auth)
  try {
    const r = await request('GET', '/api/books');
    if (r.status === 200) console.log(`✅ Public Books: OK (${r.body.length} books)`);
    else console.log(`❌ Public Books: ${r.status}`);
  } catch(e) { console.log('❌ Public Books: ERROR -', e.message); }

  // 3. Login
  let token = null;
  try {
    const r = await request('POST', '/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASS });
    if (r.status === 200 && r.body.token) {
      token = r.body.token;
      console.log(`✅ Admin Login: OK (role: ${r.body.user?.role || r.body.role})`);
    } else {
      console.log(`⚠️  Admin Login: ${r.status} - ${JSON.stringify(r.body)}`);
      console.log('   (Skipping auth-required checks)');
    }
  } catch(e) { console.log('❌ Admin Login: ERROR -', e.message); }

  if (!token) {
    console.log('\n⚠️  No token — skipping admin endpoint checks');
    console.log('   Edit ADMIN_EMAIL and ADMIN_PASS in this script with real credentials.\n');
  } else {
    // 4. Libraries
    try {
      const r = await request('GET', '/api/admin/libraries', null, token);
      if (r.status === 200) console.log(`✅ Admin Libraries: OK (${r.body.length} libraries)`);
      else console.log(`❌ Admin Libraries: ${r.status} - ${JSON.stringify(r.body)}`);
    } catch(e) { console.log('❌ Admin Libraries: ERROR -', e.message); }

    // 5. Donation Announcements
    try {
      const r = await request('GET', '/api/admin/donation-announcements', null, token);
      if (r.status === 200) console.log(`✅ Donation Announcements: OK (${r.body.length} drives)`);
      else console.log(`❌ Donation Announcements: ${r.status} - ${JSON.stringify(r.body)}`);
    } catch(e) { console.log('❌ Donation Announcements: ERROR -', e.message); }

    // 6. Donation Registrations
    try {
      const r = await request('GET', '/api/admin/donation-registrations', null, token);
      if (r.status === 200) console.log(`✅ Donation Registrations: OK (${r.body.length} registrations)`);
      else console.log(`❌ Donation Registrations: ${r.status} - ${JSON.stringify(r.body)}`);
    } catch(e) { console.log('❌ Donation Registrations: ERROR -', e.message); }

    // 7. Donation Dashboard
    try {
      const r = await request('GET', '/api/admin/donation-dashboard', null, token);
      if (r.status === 200) console.log(`✅ Donation Dashboard: OK`, r.body);
      else console.log(`❌ Donation Dashboard: ${r.status} - ${JSON.stringify(r.body)}`);
    } catch(e) { console.log('❌ Donation Dashboard: ERROR -', e.message); }

    // 8. Admin Authors
    try {
      const r = await request('GET', '/api/admin/authors', null, token);
      if (r.status === 200) console.log(`✅ Admin Authors: OK (${r.body.length} authors)`);
      else console.log(`❌ Admin Authors: ${r.status} - ${JSON.stringify(r.body)}`);
    } catch(e) { console.log('❌ Admin Authors: ERROR -', e.message); }
  }

  console.log('\n==========================================\n');
}

runChecks();
