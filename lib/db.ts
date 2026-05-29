import { Pool } from 'pg';

// Create a single connection pool to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Helper function to easily run SQL queries from your API routes
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export default pool;
