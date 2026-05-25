export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { checkRateLimit } from '@/lib/rate-limit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_ERROR = 'Invalid email or password';

type UserRow = {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: string;
  is_active: boolean;
};

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!checkRateLimit(`login:${ip}`, 10, 60_000)) {
    return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429 });
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }

  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ success: false, message: GENERIC_ERROR }, { status: 401 });
  }

  if (password.length > 128) {
    return NextResponse.json({ success: false, message: GENERIC_ERROR }, { status: 401 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ success: false, message: GENERIC_ERROR }, { status: 401 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const client = await pool.connect();
  try {
    const userResult = await client.query<UserRow>(
      `SELECT id, username, email, password_hash, role, is_active
       FROM users
       WHERE email = $1 AND is_active = TRUE AND is_deleted = FALSE`,
      [normalizedEmail]
    );

    if (userResult.rowCount === 0) {
      return NextResponse.json({ success: false, message: GENERIC_ERROR }, { status: 401 });
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      console.warn(`[login] failed attempt for ${normalizedEmail} from ${ip}`);
      return NextResponse.json({ success: false, message: GENERIC_ERROR }, { status: 401 });
    }

    const tokenPayload = {
      user_id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const [access_token, refresh_token] = await Promise.all([
      signAccessToken(tokenPayload),
      signRefreshToken(tokenPayload),
    ]);

    await client.query(`UPDATE users SET last_login = NOW() WHERE id = $1`, [user.id]);

    return NextResponse.json({
      success: true,
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } finally {
    client.release();
  }
}
