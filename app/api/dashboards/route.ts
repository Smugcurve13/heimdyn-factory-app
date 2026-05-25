export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

type DashboardRow = {
  id: string;
  name: string;
  layout: unknown;
  items: unknown;
  created_at: string;
};

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const client = await pool.connect();
  try {
    const result = await client.query<DashboardRow>(
      `SELECT id, name, layout, items, created_at
       FROM user_dashboards
       WHERE user_id = $1
       ORDER BY created_at ASC`,
      [user.user_id],
    );
    return NextResponse.json(
      result.rows.map((r) => ({
        id: r.id,
        name: r.name,
        layout: r.layout,
        items: r.items,
        createdAt: r.created_at,
      })),
    );
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const client = await pool.connect();
  try {
    const result = await client.query<DashboardRow>(
      `INSERT INTO user_dashboards (user_id, name, layout, items)
       VALUES ($1, $2, '[]', '[]')
       RETURNING id, name, layout, items, created_at`,
      [user.user_id, name],
    );
    const r = result.rows[0];
    return NextResponse.json(
      { id: r.id, name: r.name, layout: r.layout, items: r.items, createdAt: r.created_at },
      { status: 201 },
    );
  } finally {
    client.release();
  }
}
