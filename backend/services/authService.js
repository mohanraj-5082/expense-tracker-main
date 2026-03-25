const User = require("../models/User");
const generateToken = require("../utils/generateToken");

/**
 * Normalize email for Gmail (remove dots)
 */
const normalizeEmail = (email) => {
  const [local, domain] = email.toLowerCase().split('@');
  if (domain === 'gmail.com') {
    return local.replace(/\./g, '') + '@' + domain;
  }
  return email.toLowerCase();
};

/**
 * Register a new user
 */
const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error("User with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  // Create user (password hashed via pre-save hook in model)
  const user = await User.create({ name, email: normalizedEmail, password });

  const token = generateToken(user._id);

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified,
      createdAt: user.createdAt,
    },
  };
};

/**
 * Login an existing user
 */
const loginUser = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  // Find user with password field included
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified,
      createdAt: user.createdAt,
    },
  };
};

/**
 * Get current logged-in user
 */
const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

module.exports = { registerUser, loginUser, getMe };
