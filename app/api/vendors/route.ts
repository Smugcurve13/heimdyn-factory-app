export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const search = req.nextUrl.searchParams.get('search') || '';
  const status = req.nextUrl.searchParams.get('status') || '';
  const category = req.nextUrl.searchParams.get('category') || '';

  const client = await pool.connect();
  try {
    let query = `SELECT * FROM vendors WHERE is_deleted = FALSE`;
    const params: string[] = [];
    let idx = 1;

    if (search) {
      query += ` AND (name ILIKE $${idx} OR contact_person ILIKE $${idx} OR email ILIKE $${idx} OR city ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    if (status) {
      query += ` AND status = $${idx}`;
      params.push(status);
      idx++;
    }

    if (category) {
      query += ` AND category = $${idx}`;
      params.push(category);
      idx++;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await client.query(query, params);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[vendors GET]', err);
    return NextResponse.json({ success: false, message: 'Failed to fetch vendors' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const body = await req.json();
  const { name, contact_person, email, phone, category, address, city, state, status } = body;

  if (!name) {
    return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO vendors (name, contact_person, email, phone, category, address, city, state, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, contact_person || null, email || null, phone || null, category || null, address || null, city || null, state || null, status || 'active']
    );
    return NextResponse.json({ success: true, message: 'Vendor created', data: result.rows[0] });
  } catch (err) {
    console.error('[vendors POST]', err);
    return NextResponse.json({ success: false, message: 'Failed to create vendor' }, { status: 500 });
  } finally {
    client.release();
  }
}
