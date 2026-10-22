import assert from 'node:assert/strict';
import postgres from 'postgres';
const sql = postgres({
  host: process.env.PGHOST, database: process.env.PGDATABASE,
  username: process.env.PGUSER, password: process.env.PGPASSWORD, max: 8,
});
try {
  const [product] = await sql`select id from public.products where slug = 'neurokore'`;
  assert.ok(product?.id, 'NEUROKORE product missing');
  const [row] = await sql`
    insert into public.plugin_licenses(product_id,email,key_hash,key_cipher,tier,license_format)
    values (${product.id},'race@example.com','race-hash','cipher','alpha','v2') returning id`;
  const devices = ['d', 'e', 'f'].map(c => 'v2:' + c.repeat(64));
  const results = await Promise.allSettled(devices.map(device =>
    sql`select public.plugin_activate('race-hash', ${device}, 'neurokore')`));
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 2);
  const [count] = await sql`select count(*)::integer as n from public.plugin_devices where license_id=${row.id}`;
  assert.equal(count.n, 2);
  const accepted = devices[results.findIndex(result => result.status === 'fulfilled')];
  await Promise.all(Array.from({ length: 8 }, () =>
    sql`select public.plugin_activate('race-hash', ${accepted}, 'neurokore')`));
  const [retryCount] = await sql`select count(*)::integer as n from public.plugin_devices where license_id=${row.id}`;
  assert.equal(retryCount.n, 2);
  const [cross] = await sql`select public.plugin_activate('race-hash', ${accepted}, 'neurometer')`
    .then(() => [false]).catch(() => [true]);
  assert.equal(cross[0], true, 'cross-product activation must be refused');
  console.log('Concurrent seat allocation, retry and product isolation contracts passed');
} finally { await sql.end(); }
