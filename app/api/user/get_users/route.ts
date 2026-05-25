export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

type UserRow = {
  id: number;
  username: string;
  email: string;
  created_at: string;
  is_active: boolean;
  last_login: string | null;
  role: string;
};

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const idParam = searchParams.get('id');

  const client = await pool.connect();
  try {
    if (idParam) {
      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 });
      }
      const result = await client.query<UserRow>(
        `SELECT id, username, email, created_at, is_active, last_login, role
         FROM users
         WHERE id = $1 AND is_deleted = FALSE`,
        [id]
      );
      return NextResponse.json({ data: result.rows[0] ?? null });
    }

    const result = await client.query<UserRow>(
      `SELECT id, username, email, created_at, is_active, last_login, role
       FROM users
       WHERE is_deleted = FALSE
       ORDER BY created_at DESC`
    );
    return NextResponse.json({ data: result.rows });
  } finally {
    client.release();
  }
}
