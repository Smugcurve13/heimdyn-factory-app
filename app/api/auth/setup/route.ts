export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

// One-shot DB setup + seed. Protected by x-setup-secret header.
// Call: POST /api/auth/setup  with header  x-setup-secret: <SETUP_SECRET env value>
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-setup-secret');
  if (!secret || secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Ensure users table exists with the columns we need
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        username      VARCHAR(128) NOT NULL,
        email         VARCHAR(256) UNIQUE NOT NULL,
        password_hash VARCHAR(256) NOT NULL,
        role          VARCHAR(32) NOT NULL DEFAULT 'user',
        is_active     BOOLEAN DEFAULT TRUE,
        is_deleted    BOOLEAN DEFAULT FALSE,
        last_login    TIMESTAMPTZ,
        created_at    TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // If the table already existed without a role column, add it
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(32) NOT NULL DEFAULT 'user'
    `);

    // If the table had role_id from the old RBAC schema, drop it (safe — ignore if missing)
    await client.query(`
      ALTER TABLE users DROP COLUMN IF EXISTS role_id
    `);

    // Create roles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id   SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      )
    `);

    // Create permissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id              SERIAL PRIMARY KEY,
        module_name     VARCHAR(100) NOT NULL,
        permission_type VARCHAR(10) NOT NULL,
        UNIQUE (module_name, permission_type)
      )
    `);

    // Create role_permissions join table
    await client.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id            SERIAL PRIMARY KEY,
        role_id       INTEGER REFERENCES roles(id) ON DELETE CASCADE,
        permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
        UNIQUE (role_id, permission_id)
      )
    `);

    // Create user_dashboards table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_dashboards (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name       VARCHAR(200) NOT NULL,
        layout     JSONB DEFAULT '[]',
        items      JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Seed default roles
    await client.query(`
      INSERT INTO roles (name) VALUES ('superadmin'), ('manager'), ('operator')
      ON CONFLICT (name) DO NOTHING
    `);

    // Seed permissions for all modules
    await client.query(`
      INSERT INTO permissions (module_name, permission_type)
      SELECT m, a FROM
        unnest(ARRAY['dashboard','production','material','sales','analysis','clients','vendors','users','roles']) AS m
        CROSS JOIN unnest(ARRAY['c','r','u','d']) AS a
      ON CONFLICT (module_name, permission_type) DO NOTHING
    `);

    // Assign all permissions to superadmin
    await client.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
      WHERE r.name = 'superadmin'
      ON CONFLICT (role_id, permission_id) DO NOTHING
    `);

    // Create clients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id              SERIAL PRIMARY KEY,
        name            VARCHAR(200) NOT NULL,
        contact_person  VARCHAR(100),
        email           VARCHAR(255),
        phone           VARCHAR(20),
        address         TEXT,
        city            VARCHAR(100),
        state           VARCHAR(100),
        status          VARCHAR(20) DEFAULT 'active',
        is_deleted      BOOLEAN DEFAULT FALSE,
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        updated_at      TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Create vendors table
    await client.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id              SERIAL PRIMARY KEY,
        name            VARCHAR(200) NOT NULL,
        contact_person  VARCHAR(100),
        email           VARCHAR(255),
        phone           VARCHAR(20),
        category        VARCHAR(100),
        address         TEXT,
        city            VARCHAR(100),
        state           VARCHAR(100),
        status          VARCHAR(20) DEFAULT 'active',
        is_deleted      BOOLEAN DEFAULT FALSE,
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        updated_at      TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Seed superadmin
    const adminEmail = 'sambhavsoni14@gmail.com';
    const adminHash = await bcrypt.hash('12345', 12);
    await client.query(
      `INSERT INTO users (username, email, password_hash, role, is_active)
       VALUES ('Sambhav', $1, $2, 'superadmin', TRUE)
       ON CONFLICT (email) DO UPDATE
         SET password_hash = EXCLUDED.password_hash,
             role = 'superadmin',
             is_active = TRUE,
             is_deleted = FALSE`,
      [adminEmail, adminHash]
    );

    await client.query('COMMIT');
    return NextResponse.json({ success: true, message: 'Setup complete' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[setup]', err);
    return NextResponse.json({ success: false, message: 'Setup failed', error: String(err) }, { status: 500 });
  } finally {
    client.release();
  }
}
