import { NextResponse } from 'next/server';

// Tokens are stateless JWTs — logout is handled client-side by clearing storage.
// This endpoint exists for clients that want a server-acknowledged logout.
export async function POST() {
  return NextResponse.json({ success: true, message: 'Logged out' });
}
