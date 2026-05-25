import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signAccessToken, type TokenPayload } from '@/lib/jwt';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!checkRateLimit(`refresh:${ip}`, 30, 60_000)) {
    return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429 });
  }

  let body: { refresh_token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }

  const { refresh_token } = body;
  if (!refresh_token) {
    return NextResponse.json({ success: false, message: 'refresh_token required' }, { status: 400 });
  }

  const result = await verifyToken(refresh_token);
  if (result.error) {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired refresh token', code: result.error },
      { status: 401 }
    );
  }

  const payload = result.payload as TokenPayload & { type?: string };
  if (payload.type !== 'refresh') {
    return NextResponse.json(
      { success: false, message: 'Invalid token type', code: 'token_invalid' },
      { status: 401 }
    );
  }

  const tokenPayload: TokenPayload = {
    user_id: payload.user_id,
    email: payload.email,
    username: payload.username,
    role: payload.role,
  };

  const access_token = await signAccessToken(tokenPayload);
  return NextResponse.json({ success: true, access_token });
}
