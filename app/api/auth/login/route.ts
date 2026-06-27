import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // AUTO-SETUP: Create table and default users automatically if they don't exist
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(100),
        name VARCHAR(255),
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;
      ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);

      CREATE TABLE IF NOT EXISTS user_process_mapping (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        process_id INTEGER REFERENCES master_process(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, process_id)
      );
    `);
    
    await query(`
      INSERT INTO users (employee_id, name, username, password, role) 
      VALUES 
        ('ims9643', 'pawan', 'hr_user', 'hr_user', 'hr'), 
        ('ims7191', 'ankit', 'admin_user', 'admin123', 'admin'),
        ('GGN001', 'Gurugram User', 'ggn_user', 'password123', 'user'),
        ('DEL001', 'Delhi User', 'del_user', 'password123', 'user'),
        ('UN001', 'Uttam Nagar User', 'un_user', 'password123', 'user')
      ON CONFLICT (username) DO NOTHING;
    `);

    const { employee_id, password, role } = await request.json();

    // Query the database for a matching user strictly based on provided role
    const result = await query(
      'SELECT id, employee_id, name, username, role FROM users WHERE employee_id = $1 AND password = $2 AND role = $3',
      [employee_id, password, role]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      
      const response = NextResponse.json({ success: true, message: 'Login successful', user });
      
      // Create a secure HttpOnly session cookie
      response.cookies.set('auth_session', JSON.stringify({ id: user.id, employee_id: user.employee_id, name: user.name, username: user.username, role: user.role }), {
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
