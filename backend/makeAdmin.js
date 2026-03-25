require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const makeAdmin = async () => {
  try {
    // 1. Connect to the database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // 2. Get the email from the command line arguments
    const emailToPromote = process.argv[2];
    
    if (!emailToPromote) {
      console.log("\n❌ Please provide an email address.");
      console.log("Usage: node makeAdmin.js <user-email>");
      process.exit(1);
    }

    // 3. Find the user
    const user = await User.findOne({ email: emailToPromote });
    
    if (!user) {
      console.log(`\n❌ User with email "${emailToPromote}" not found in database.`);
      process.exit(1);
    }

    // 4. Update the user
    user.role = "admin";
    user.verified = true; // Let's also verify them so they have full access
    await user.save();

    console.log(`\n✅ SUCCESS: The user "${user.name}" (${user.email}) is now an Admin!`);
    console.log("You can now log in with this account to see the Admin Dashboard.");

  } catch (error) {
    console.error("Error connecting to database:", error);
  } finally {
    // Close the connection
    mongoose.connection.close();
    process.exit(0);
  }
};

makeAdmin();
