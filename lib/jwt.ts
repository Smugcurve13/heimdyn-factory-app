import { SignJWT, jwtVerify } from 'jose';

const secret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET ?? 'dev-only-secret-change-before-production-min32'
  );

export type TokenPayload = {
  user_id: number;
  email: string;
  username: string;
  role: string;
};

export async function signAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secret());
}

export async function signRefreshToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());
}

type VerifyResult =
  | { payload: TokenPayload & Record<string, unknown>; error: null }
  | { payload: null; error: 'token_expired' | 'token_invalid' };

export async function verifyToken(token: string): Promise<VerifyResult> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return { payload: payload as TokenPayload & Record<string, unknown>, error: null };
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    return {
      payload: null,
      error: code === 'ERR_JWT_EXPIRED' ? 'token_expired' : 'token_invalid',
    };
  }
}
