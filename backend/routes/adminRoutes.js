const express = require("express");
const router = express.Router();
const { getAllUsers, verifyUser } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// @route GET /api/admin/users
router.get("/users", getAllUsers);

// @route PATCH /api/admin/users/:id/verify
router.patch("/users/:id/verify", verifyUser);

module.exports = router;
