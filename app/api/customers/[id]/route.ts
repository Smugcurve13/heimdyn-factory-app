export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const { id } = await params;
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM customers WHERE id = $1 AND is_deleted = FALSE', [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[customers GET by id]', err);
    return NextResponse.json({ success: false, message: 'Failed to fetch customer' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await req.json();
  const { name, contact_person, email, phone, address, city, state, status } = body;

  if (!name) {
    return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE customers SET name=$1, contact_person=$2, email=$3, phone=$4, address=$5, city=$6, state=$7, status=$8, updated_at=NOW()
       WHERE id=$9 AND is_deleted = FALSE
       RETURNING *`,
      [name, contact_person || null, email || null, phone || null, address || null, city || null, state || null, status || 'active', id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Customer updated', data: result.rows[0] });
  } catch (err) {
    console.error('[customers PUT]', err);
    return NextResponse.json({ success: false, message: 'Failed to update customer' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const { id } = await params;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE customers SET is_deleted = TRUE, updated_at = NOW() WHERE id = $1 AND is_deleted = FALSE RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Customer deleted' });
  } catch (err) {
    console.error('[customers DELETE]', err);
    return NextResponse.json({ success: false, message: 'Failed to delete customer' }, { status: 500 });
  } finally {
    client.release();
  }
}
