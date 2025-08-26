import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runPaymentMigration() {
  console.log('🚀 Starting payment tables migration...');

  try {
    // Get database connection string
    const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL or NEON_DATABASE_URL environment variable is required');
    }

    console.log('🔗 Connecting to Neon database...');
    const sql = neon(DATABASE_URL);

    // Read the SQL migration file
    const migrationPath = path.join(__dirname, 'create-payment-tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Executing payment tables migration...');
    
    // Split the SQL into individual statements and execute them
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          console.log(`🔧 Executing statement ${i + 1}/${statements.length}...`);
          await sql`${statement}`;
        } catch (error: any) {
          // Ignore "already exists" errors
          if (error.message?.includes('already exists') || error.message?.includes('relation') && error.message?.includes('exists')) {
            console.log(`⚠️  Skipping statement ${i + 1} (already exists): ${statement.substring(0, 50)}...`);
            continue;
          }
          throw error;
        }
      }
    }

    console.log('✅ Payment tables migration completed successfully!');
    
    // Verify the tables were created
    console.log('🔍 Verifying payment tables...');
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('payments', 'subscriptions', 'job_payments', 'success_fees', 'payment_packages', 'billing_events')
      ORDER BY table_name
    `;

    console.log('📊 Payment tables found:');
    tables.forEach(table => {
      console.log(`  ✓ ${table.table_name}`);
    });

    // Check if default payment packages were inserted
    const packages = await sql`SELECT COUNT(*) as count FROM payment_packages`;
    console.log(`📦 Payment packages in database: ${packages[0].count}`);

    if (packages[0].count === 0) {
      console.log('⚠️  No payment packages found. The migration may not have completed fully.');
    }

    console.log('🎉 Payment system database setup complete!');

  } catch (error) {
    console.error('❌ Payment migration failed:', error);
    process.exit(1);
  }
}

// Run the migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPaymentMigration()
    .then(() => {
      console.log('✨ Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

export default runPaymentMigration;
