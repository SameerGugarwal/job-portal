const mongoose = require("mongoose");

// Connects to MongoDB Atlas using the URI from .env
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected ✅");
  } catch (err) {
    console.error("MongoDB connection error ❌:", err.message);
    process.exit(1); // stop the server if DB fails
  }
};

module.exports = connectDB;
