import { Pool } from 'pg';

// Neon database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Tc6aeZpim1yK@ep-summer-frog-ae2cm4m2-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to Neon PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Neon database error:', err);
});

// Execute query function
export const executeNeonQuery = async (text: string, params?: any[]): Promise<any[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Get database statistics
export const getDatabaseStats = async () => {
  try {
    const stats = await executeNeonQuery(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'candidate') as total_candidates,
        (SELECT COUNT(*) FROM users WHERE role = 'company') as total_companies,
        (SELECT COUNT(*) FROM jobs WHERE status = 'active') as active_jobs,
        (SELECT COUNT(*) FROM applications) as total_applications,
        (SELECT COUNT(*) FROM conversations WHERE blocked = false) as active_conversations
    `);
    return stats[0];
  } catch (error) {
    console.error('Error getting database stats:', error);
    return null;
  }
};

export default pool;
