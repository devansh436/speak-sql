/**
 * Seed script to create test users for each role
 * Run with: node seed-users.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/nlq_auth";

const testUsers = [
  {
    firebaseUid: "demo-user-uid",
    username: "demo_user",
    email: "user@demo.com",
    role: "USER",
  },
  {
    firebaseUid: "demo-staff-uid",
    username: "demo_staff",
    email: "staff@demo.com",
    role: "STAFF",
  },
  {
    firebaseUid: "demo-admin-uid",
    username: "demo_admin",
    email: "admin@demo.com",
    role: "ADMIN",
  },
];

async function seedUsers() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    console.log("🗑️  Clearing existing test users...");
    await User.deleteMany({
      username: { $in: testUsers.map((u) => u.username) },
    });
    console.log("✅ Cleared\n");

    console.log("👥 Creating test users...\n");

    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();

      console.log(`✅ Created ${userData.role} user:`);
      console.log(`   Firebase UID: ${userData.firebaseUid}`);
      console.log(`   Username: ${userData.username}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Role: ${userData.role}\n`);
    }

    console.log("🎉 All test users created successfully!\n");
    console.log("📝 These are profile records for Firebase-authenticated users:");
    console.log("=".repeat(50));
    testUsers.forEach((u) => {
      console.log(`\n${u.role}:`);
      console.log(`  Email: ${u.email}`);
      console.log(`  Firebase UID: ${u.firebaseUid}`);
    });
    console.log("\n" + "=".repeat(50));
  } catch (error) {
    console.error("❌ Error seeding users:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
  }
}

seedUsers();
