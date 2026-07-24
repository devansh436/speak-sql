const mongoose = require("mongoose");
require("dotenv").config();

const connectMongoDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/nlq_auth";

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10,
      minPoolSize: 1,
    });

    // Set bufferCommands AFTER successful connection
    mongoose.set("bufferCommands", false);
    mongoose.set("bufferTimeoutMS", 5000);

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.log("\n💡 Solutions:");
    console.log(
      "   1. For local MongoDB: Use mongodb://localhost:27017/nlq_auth"
    );
    console.log(
      "   2. For MongoDB Atlas: Ensure correct credentials and database name"
    );
    console.log(
      "   3. Check if MongoDB is running (local) or IP whitelisted (Atlas)\n"
    );

    // Don't exit process, just warn
    console.log("⚠️  Server starting without MongoDB (auth features disabled)");
    throw error; // Re-throw to let caller handle it
  }
};

module.exports = connectMongoDB;
