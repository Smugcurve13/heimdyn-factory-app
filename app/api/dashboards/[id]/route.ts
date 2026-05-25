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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const client = await pool.connect();
  try {
    const result = await client.query<DashboardRow>(
      `SELECT id, name, layout, items, created_at
       FROM user_dashboards
       WHERE id = $1 AND user_id = $2`,
      [id, user.user_id],
    );
    if (result.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const r = result.rows[0];
    return NextResponse.json({
      id: r.id,
      name: r.name,
      layout: r.layout,
      items: r.items,
      createdAt: r.created_at,
    });
  } finally {
    client.release();
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  let body: { layout?: unknown; items?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE user_dashboards
       SET layout = $1, items = $2, updated_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING id`,
      [JSON.stringify(body.layout ?? []), JSON.stringify(body.items ?? []), id, user.user_id],
    );
    if (result.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } finally {
    client.release();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const client = await pool.connect();
  try {
    await client.query(
      `DELETE FROM user_dashboards WHERE id = $1 AND user_id = $2`,
      [id, user.user_id],
    );
    return NextResponse.json({ success: true });
  } finally {
    client.release();
  }
}
