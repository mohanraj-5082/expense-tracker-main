require("dotenv").config();
const mongoose = require("mongoose");

console.log("Testing MongoDB connection...");
console.log("URI:", process.env.MONGO_URI ? "✓ Loaded" : "✗ Missing");

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  tls: true,
})
  .then(() => {
    console.log("✅ Connected successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Connection failed:");
    console.error(error.message);
    process.exit(1);
  });
