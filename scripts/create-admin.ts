import { config } from "dotenv";
config({ path: ".env.local" });

import { getUsersCollection, closeDatabaseConnections } from "../src/lib/database";
import bcrypt from "bcryptjs";
import { Role } from "../src/types/user";

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error("Please provide ADMIN_EMAIL and ADMIN_PASSWORD in your .env.local file");
  process.exit(1);
}

async function createAdmin() {
  try {
    const users = await getUsersCollection();

    const existingAdmin = await users.findOne({ email });

    if (existingAdmin) {
      console.log("Admin user already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await users.insertOne({
      email,
      password: hashedPassword,
      role: Role.ADMIN,
      createdAt: new Date(),
    });

    console.log("Admin user created successfully.");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await closeDatabaseConnections();
  }
}

createAdmin();
