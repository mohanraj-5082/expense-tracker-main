const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { registerValidator, loginValidator } = require("../validators/authValidator");

// @route POST /api/auth/register
router.post("/register", registerValidator, register);

// @route POST /api/auth/login
router.post("/login", loginValidator, login);

// @route GET /api/auth/me
router.get("/me", protect, getMe);

module.exports = router;
