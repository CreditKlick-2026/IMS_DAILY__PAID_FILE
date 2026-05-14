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
        role VARCHAR(20) NOT NULL
      );
    `);

    // Insert an HR user
    await query(`
      INSERT INTO users (username, password, role) 
      VALUES ('hr_user', 'hr123', 'hr')
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
        { username: 'hr_user', password: 'hr123', role: 'hr' },
        { username: 'admin_user', password: 'admin123', role: 'admin' }
      ]
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
