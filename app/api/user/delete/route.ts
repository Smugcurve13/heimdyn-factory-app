export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  let body: { user_id?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }

  const { user_id } = body;
  if (!user_id) {
    return NextResponse.json({ success: false, message: 'user_id required' }, { status: 400 });
  }

  // Prevent self-deletion
  if (user_id === auth.user.user_id) {
    return NextResponse.json({ success: false, message: 'Cannot delete your own account' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE users SET is_deleted=TRUE, is_active=FALSE WHERE id=$1 AND is_deleted=FALSE`,
      [user_id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } finally {
    client.release();
  }
}
