export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const client = await pool.connect();
  try {
    const result = await client.query<{ module_name: string; permission_type: string }>(
      `SELECT module_name, permission_type FROM permissions ORDER BY module_name, permission_type`
    );

    // Return as { module: [types] } â€” matching what the users-and-roles page expects
    const out: Record<string, string[]> = {};
    for (const { module_name, permission_type } of result.rows) {
      if (!out[module_name]) out[module_name] = [];
      out[module_name].push(permission_type);
    }

    return NextResponse.json(out);
  } finally {
    client.release();
  }
}
