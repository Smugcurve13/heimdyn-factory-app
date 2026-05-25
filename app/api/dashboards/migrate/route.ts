export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// One-shot: POST /api/dashboards/migrate  (header: x-setup-secret)
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-setup-secret');
  if (!secret || secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_dashboards (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name       TEXT NOT NULL,
        layout     JSONB NOT NULL DEFAULT '[]',
        items      JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS user_dashboards_user_id_idx ON user_dashboards(user_id)
    `);
    return NextResponse.json({ success: true, message: 'user_dashboards table ready' });
  } catch (err) {
    console.error('[dashboards/migrate]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  } finally {
    client.release();
  }
}
