import 'dotenv/config';
import { storage } from '../server/storage';
import { pool } from '../server/db';

async function seed() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@agromarket.com";
  console.log(`Checking for admin with email: ${adminEmail}...`);
  try {
    const user = await storage.getUserByEmail(adminEmail);
    if (!user) {
      await storage.createUser({
        email: adminEmail,
        firstName: "System",
        lastName: "Admin",
        role: "admin"
      });
      console.log(`Admin user ${adminEmail} seeded successfully!`);
    } else if (user.role !== "admin") {
      await storage.updateUserRole(user.id, "admin");
      console.log(`User ${adminEmail} upgraded to admin role.`);
    } else {
      console.log(`Admin user ${adminEmail} already exists with admin role.`);
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await pool.end();
  }
}

seed();
