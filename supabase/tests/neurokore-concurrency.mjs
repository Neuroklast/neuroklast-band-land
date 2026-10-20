import assert from 'node:assert/strict';
import postgres from 'postgres';
const sql = postgres({
  host: process.env.PGHOST, database: process.env.PGDATABASE,
  username: process.env.PGUSER, password: process.env.PGPASSWORD, max: 8,
});
try {
  const [row] = await sql`insert into public.neurokore_licenses(email,key_hash,key_cipher,tier) values ('race@example.com','race-hash','cipher','alpha') returning id`;
  const devices = ['d', 'e', 'f'].map(c => 'v2:' + c.repeat(64));
  const results = await Promise.allSettled(devices.map(device =>
    sql`select public.neurokore_activate('race-hash', ${device})`));
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 2);
  const [count] = await sql`select count(*)::integer as n from public.neurokore_devices where license_id=${row.id}`;
  assert.equal(count.n, 2);
  const accepted = devices[results.findIndex(result => result.status === 'fulfilled')];
  await Promise.all(Array.from({ length: 8 }, () =>
    sql`select public.neurokore_activate('race-hash', ${accepted})`));
  const [retryCount] = await sql`select count(*)::integer as n from public.neurokore_devices where license_id=${row.id}`;
  assert.equal(retryCount.n, 2);
  console.log('Concurrent seat allocation and retry contracts passed');
} finally { await sql.end(); }
