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

  let body: { username?: string; email?: string; password?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }

  const { username, email, password, role } = body;

  if (!username || !email || !password || !role) {
    return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ success: false, message: 'Invalid email format' }, { status: 400 });
  }

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const hash = await bcrypt.hash(password, 12);

  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO users (username, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, TRUE)
       RETURNING id, username, email, role, created_at, is_active`,
      [username.trim(), normalizedEmail, hash, role]
    );

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
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
