import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, type TokenPayload } from './jwt';

type AuthSuccess = { user: TokenPayload; error: null };
type AuthFailure = { user: null; error: NextResponse };

export async function requireAuth(req: NextRequest): Promise<AuthSuccess | AuthFailure> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      user: null,
      error: NextResponse.json({ success: false, message: 'Missing token', code: 'token_invalid' }, { status: 401 }),
    };
  }

  const token = authHeader.slice(7);
  const result = await verifyToken(token);

  if (result.error) {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, message: 'Unauthorized', code: result.error },
        { status: 401 }
      ),
    };
  }

  return { user: result.payload as TokenPayload, error: null };
}
