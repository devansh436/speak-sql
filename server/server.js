require("dotenv").config();

const connectMongoDB = require("./config/mongodb");
const app = require('./app');
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Wait for MongoDB connection before starting server
    await connectMongoDB();
    console.log("✅ MongoDB ready for user profile sync");

    // Only listen locally, not on Vercel
    if (process.env.NODE_ENV === "development") {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(
          `⚕️ Check server health on http://localhost:${PORT}/api/health`,
        );
        console.log(`🔐 Firebase Auth middleware ready`);
        console.log(`📊 Role-based access control active`);
      });
    }
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    console.log(
      "⚠️ Server starting without MongoDB (profile sync and admin features may not work)",
    );
  }
};

startServer();
