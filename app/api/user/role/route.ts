export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

type RoleRequest = {
  action: 'create' | 'edit';
  role_id?: number;
  name?: string;
  permissions?: Record<string, string>; // { dashboard: "r,c,u", ... }
};

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  let body: RoleRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }

  const { action, role_id, name, permissions } = body;

  if (!action || !name?.trim()) {
    return NextResponse.json({ success: false, message: 'action and name are required' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let targetRoleId: number;

    if (action === 'create') {
      const result = await client.query<{ id: number }>(
        `INSERT INTO roles (name) VALUES ($1) RETURNING id`,
        [name.trim()]
      );
      targetRoleId = result.rows[0].id;
    } else {
      if (!role_id) {
        await client.query('ROLLBACK');
        return NextResponse.json({ success: false, message: 'role_id required for edit' }, { status: 400 });
      }
      await client.query(`UPDATE roles SET name=$1 WHERE id=$2`, [name.trim(), role_id]);
      targetRoleId = role_id;
      // Clear existing permissions before reassigning
      await client.query(`DELETE FROM role_permissions WHERE role_id=$1`, [role_id]);
    }

    if (permissions && Object.keys(permissions).length > 0) {
      for (const [module, typeStr] of Object.entries(permissions)) {
        const types = typeStr.split(',').map((t) => t.trim()).filter(Boolean);
        for (const t of types) {
          const permRow = await client.query<{ id: number }>(
            `SELECT id FROM permissions WHERE module_name=$1 AND permission_type=$2`,
            [module, t]
          );
          if (permRow.rowCount && permRow.rowCount > 0) {
            await client.query(
              `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
              [targetRoleId, permRow.rows[0].id]
            );
          }
        }
      }
    }

    await client.query('COMMIT');
    return NextResponse.json({
      success: true,
      message: action === 'create' ? 'Role created successfully' : 'Role updated successfully',
      data: { id: targetRoleId, name: name.trim() },
    });
  } catch (err: unknown) {
    await client.query('ROLLBACK');
    if ((err as { code?: string }).code === '23505') {
      return NextResponse.json({ success: false, message: 'Role name already exists' }, { status: 409 });
    }
    throw err;
  } finally {
    client.release();
  }
}
