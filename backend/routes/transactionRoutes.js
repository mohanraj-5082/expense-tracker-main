const express = require("express");
const router = express.Router();
const {
  getTransactions,
  getSummary,
  getMonthlyStats,
  getCategoryStats,
  createTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");
const { protect } = require("../middleware/authMiddleware");

// All routes are protected
router.use(protect);

// @route GET  /api/transactions/summary
router.get("/summary", getSummary);

// @route GET  /api/transactions/monthly
router.get("/monthly", getMonthlyStats);

// @route GET  /api/transactions/category-stats
router.get("/category-stats", getCategoryStats);

// @route GET  /api/transactions
// @route POST /api/transactions
router.route("/").get(getTransactions).post(createTransaction);

// @route DELETE /api/transactions/:id
router.delete("/:id", deleteTransaction);

module.exports = router;
