import { neon } from '@neondatabase/serverless';

export const config = { maxDuration: 55 }; // Vercel max for hobby plan

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  let lastUpdatedAt = null;

  const send = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // ส่งค่าปัจจุบันทันทีที่เชื่อมต่อ
  try {
    const rows = await sql`SELECT * FROM timer_config WHERE id = 1`;
    if (rows.length > 0) {
      const r = rows[0];
      lastUpdatedAt = r.updated_at;
      send({ h: r.h, m: r.m, s: r.s, interval: r.interval_sec, updatedAt: r.updated_at });
    }
  } catch (e) {
    send({ error: e.message });
  }

  // poll ทุก 2 วิ
  const interval = setInterval(async () => {
    try {
      const rows = await sql`SELECT updated_at, h, m, s, interval_sec FROM timer_config WHERE id = 1`;
      if (rows.length === 0) return;
      const r = rows[0];
      if (r.updated_at !== lastUpdatedAt) {
        lastUpdatedAt = r.updated_at;
        send({ h: r.h, m: r.m, s: r.s, interval: r.interval_sec, updatedAt: r.updated_at });
      }
    } catch (e) {
      send({ error: e.message });
    }
  }, 2000);

  req.on('close', () => clearInterval(interval));
}
