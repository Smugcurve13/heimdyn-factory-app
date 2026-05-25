export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = ['superadmin', 'user'];

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  let body: { user_id?: number; username?: string; email?: string; password?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }

  const { user_id, username, email, password, role } = body;

  if (!user_id || !username || !email || !role) {
    return NextResponse.json({ success: false, message: 'user_id, username, email and role are required' }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ success: false, message: 'Invalid email format' }, { status: 400 });
  }

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const client = await pool.connect();
  try {
    if (password) {
      const hash = await bcrypt.hash(password, 12);
      await client.query(
        `UPDATE users SET username=$1, email=$2, password_hash=$3, role=$4
         WHERE id=$5 AND is_deleted=FALSE`,
        [username.trim(), normalizedEmail, hash, role, user_id]
      );
    } else {
      await client.query(
        `UPDATE users SET username=$1, email=$2, role=$3
         WHERE id=$4 AND is_deleted=FALSE`,
        [username.trim(), normalizedEmail, role, user_id]
      );
    }

    const result = await client.query(
      `SELECT id, username, email, role FROM users WHERE id = $1`,
      [user_id]
    );

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: result.rows[0],
    });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === '23505') {
      return NextResponse.json({ success: false, message: 'Email already exists' }, { status: 409 });
    }
    throw err;
  } finally {
    client.release();
  }
}
