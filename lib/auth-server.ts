import { NextRequest } from 'next/server';
import { verifyToken, TokenPayload } from './jwt';

export async function getUserFromRequest(
  req: NextRequest,
): Promise<(TokenPayload & Record<string, unknown>) | null> {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const result = await verifyToken(token);
  if (result.error) return null;
  return result.payload;
}
