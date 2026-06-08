import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Create the users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL,
        email VARCHAR(255)
      );
    `);

    // Insert a test user
    await query(`
      INSERT INTO users (username, password, role) 
      VALUES ('test_user', 'test123', 'user')
      ON CONFLICT (username) DO NOTHING;
    `);

    // Insert an Admin user
    await query(`
      INSERT INTO users (username, password, role) 
      VALUES ('admin_user', 'admin123', 'admin')
      ON CONFLICT (username) DO NOTHING;
    `);

    return NextResponse.json({ 
      message: 'Database setup complete. Users created.',
      test_users: [
        { username: 'test_user', password: 'test123', role: 'user' },
        { username: 'admin_user', password: 'admin123', role: 'admin' }
      ]
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
