const transactionService = require("../services/transactionService");
const mongoose = require("mongoose");

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
    const { type, category, amount, description, date } = req.body;

    if (!type || !category || !amount) {
      return res
        .status(400)
        .json({ success: false, message: "Type, category, and amount are required" });
    }

    if (!["income", "expense"].includes(type)) {
      return res
        .status(400)
        .json({ success: false, message: "Type must be income or expense" });
    }

    if (amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Amount must be greater than 0" });
    }

    const transaction = await transactionService.createTransaction(
      req.user._id,
      { type, category, amount: parseFloat(amount), description, date }
    );

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
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
