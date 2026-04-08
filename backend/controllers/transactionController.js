const { validationResult } = require("express-validator");
const transactionService = require("../services/transactionService");
const mongoose = require("mongoose");

// ─── XSS sanitiser helper ─────────────────────────────────────────────────
const stripHtml = (str) =>
  typeof str === "string"
    ? str.replace(/<[^>]*>/g, "").replace(/[<>"'`]/g, "").trim()
    : str;

/**
 * @route  GET /api/transactions
 * @access Private
 */
const getTransactions = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate } = req.query;
    const transactions = await transactionService.getTransactions(
      req.user._id,
      { type, category, startDate, endDate }
    );
    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /api/transactions/summary
 * @access Private
 */
const getSummary = async (req, res, next) => {
  try {
    const summary = await transactionService.getSummary(
      new mongoose.Types.ObjectId(req.user._id)
    );
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /api/transactions/monthly
 * @access Private
 */
const getMonthlyStats = async (req, res, next) => {
  try {
    const stats = await transactionService.getMonthlyStats(
      new mongoose.Types.ObjectId(req.user._id)
    );
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /api/transactions/category-stats
 * @access Private
 */
const getCategoryStats = async (req, res, next) => {
  try {
    const { type } = req.query;
    const stats = await transactionService.getCategoryStats(
      new mongoose.Types.ObjectId(req.user._id),
      type || "expense"
    );
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  POST /api/transactions
 * @access Private
 */
const createTransaction = async (req, res, next) => {
  try {
    // 1. Run express-validator results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,   // first error message
        errors: errors.array(),
      });
    }

    const { type, category, amount, description, date } = req.body;

    // 2. Belt-and-suspenders: sanitize description against XSS
    const safeDescription = stripHtml(description || "");

    // 3. Extra numeric guard (belt + suspenders on top of validator)
    const parsedAmount = parseFloat(amount);
    if (!isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: "Amount must be greater than 0" });
    }
    if (parsedAmount > 9999999.99) {
      return res.status(400).json({ success: false, message: "Amount cannot exceed ₹9,999,999.99" });
    }

    const transaction = await transactionService.createTransaction(
      req.user._id,
      {
        type,
        category,
        amount: parsedAmount,
        description: safeDescription,
        date,
      }
    );

    res.status(201).json({
      success: true,
      message: "Transaction added successfully",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  DELETE /api/transactions/:id
 * @access Private
 */
const deleteTransaction = async (req, res, next) => {
  try {
    const result = await transactionService.deleteTransaction(
      req.user._id,
      req.params.id
    );
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getSummary,
  getMonthlyStats,
  getCategoryStats,
  createTransaction,
  deleteTransaction,
};
