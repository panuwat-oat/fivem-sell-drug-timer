import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS timer_config (
      id    INTEGER PRIMARY KEY DEFAULT 1,
      h     INTEGER NOT NULL,
      m     INTEGER NOT NULL,
      s     INTEGER NOT NULL,
      interval_sec INTEGER NOT NULL DEFAULT 300,
      updated_at   BIGINT NOT NULL
    )
  `;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  await ensureTable();

  if (req.method === 'GET') {
    const rows = await sql`SELECT * FROM timer_config WHERE id = 1`;
    if (rows.length === 0) { res.status(404).json({ error: 'no config' }); return; }
    const r = rows[0];
    res.json({ h: r.h, m: r.m, s: r.s, interval: r.interval_sec, updatedAt: r.updated_at });
    return;
  }

  if (req.method === 'POST') {
    const { h, m, s, interval } = req.body;
    if (h == null || m == null || s == null || interval == null) {
      res.status(400).json({ error: 'missing fields' }); return;
    }
    await sql`
      INSERT INTO timer_config (id, h, m, s, interval_sec, updated_at)
      VALUES (1, ${h}, ${m}, ${s}, ${interval}, ${Date.now()})
      ON CONFLICT (id) DO UPDATE
        SET h = ${h}, m = ${m}, s = ${s},
            interval_sec = ${interval}, updated_at = ${Date.now()}
    `;
    res.json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'method not allowed' });
}
