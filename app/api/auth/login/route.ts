import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // AUTO-SETUP: Create table and default users automatically if they don't exist
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL
      );
    `);
    
    await query(`
      INSERT INTO users (username, password, role) 
      VALUES 
        ('hr_user', 'hr123', 'hr'), 
        ('admin_user', 'admin123', 'admin')
      ON CONFLICT (username) DO NOTHING;
    `);

    const { username, password, role } = await request.json();

    // Query the neon database for a matching user
    const result = await query(
      'SELECT id, username, role FROM users WHERE username = $1 AND password = $2 AND role = $3',
      [username, password, role]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      
      const response = NextResponse.json({ success: true, message: 'Login successful', user });
      
      // Create a secure HttpOnly session cookie
      response.cookies.set('auth_session', JSON.stringify({ id: user.id, username: user.username, role: user.role }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });
      
      return response;
    } else {
      // No match
      return NextResponse.json({ success: false, message: 'Invalid credentials or role mismatch' }, { status: 401 });
    }
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
