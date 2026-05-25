export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const client = await pool.connect();
  try {
    const rolesResult = await client.query<{ id: number; name: string }>(
      `SELECT id, name FROM roles ORDER BY id`
    );

    const rolesWithPermissions = [];
    for (const role of rolesResult.rows) {
      const permResult = await client.query<{ module_name: string; permission_type: string }>(
        `SELECT p.module_name, p.permission_type
         FROM role_permissions rp
         JOIN permissions p ON p.id = rp.permission_id
         WHERE rp.role_id = $1
         ORDER BY p.module_name, p.permission_type`,
        [role.id]
      );

      const permissions: Record<string, string[]> = {};
      for (const row of permResult.rows) {
        if (!permissions[row.module_name]) permissions[row.module_name] = [];
        permissions[row.module_name].push(row.permission_type);
      }

      rolesWithPermissions.push({
        id: role.id,
        name: role.name,
        permissions,
      });
    }

    return NextResponse.json({ data: rolesWithPermissions });
  } finally {
    client.release();
  }
}
