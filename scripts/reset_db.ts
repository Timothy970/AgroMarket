
import 'dotenv/config';
import { db, pool } from '../server/db';
import { sql } from 'drizzle-orm';

async function resetDb() {
  console.log('Dropping all tables...');
  try {
    // Disable foreign key checks to allow dropping tables in any order (Postgres doesn't have a global toggle, but CASCADE handles it)
    await db.execute(sql`DROP TABLE IF EXISTS "cart_items" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "categories" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "orders" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "otp_requests" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "products" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "sessions" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "users" CASCADE`);
    
    // Drop enums if they exist
    await db.execute(sql`DROP TYPE IF EXISTS "order_status" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "payout_method" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "product_status" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "purchase_mode" CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS "user_role" CASCADE`);

    console.log('All tables and types dropped successfully.');
  } catch (error) {
    console.error('Error dropping tables:', error);
  } finally {
    await pool.end();
  }
}

resetDb();
