const Transaction = require("../models/Transaction");

/**
 * Get all transactions for a user with optional filters
 */
const getTransactions = async (userId, filters = {}) => {
  const query = { userId };

  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;
  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = new Date(filters.startDate);
    if (filters.endDate) query.date.$lte = new Date(filters.endDate);
  }

  const transactions = await Transaction.find(query).sort({ date: -1 });
  return transactions;
};

/**
 * Get dashboard summary (balance, income, expense totals)
 */
const getSummary = async (userId) => {
  const result = await Transaction.aggregate([
    { $match: { userId: userId } },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);

  let totalIncome = 0;
  let totalExpense = 0;

  result.forEach((item) => {
    if (item._id === "income") totalIncome = item.total;
    if (item._id === "expense") totalExpense = item.total;
  });

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
};

/**
 * Get monthly breakdown for charts
 */
const getMonthlyStats = async (userId) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const result = await Transaction.aggregate([
    {
      $match: {
        userId: userId,
        date: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return result;
};

/**
 * Get category breakdown for pie chart
 */
const getCategoryStats = async (userId, type = "expense") => {
  const result = await Transaction.aggregate([
    { $match: { userId: userId, type } },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);
  return result;
};

/**
 * Create a new transaction
 */
const createTransaction = async (userId, data) => {
  const transaction = await Transaction.create({ userId, ...data });
  return transaction;
};

/**
 * Delete a transaction
 */
const deleteTransaction = async (userId, transactionId) => {
  const transaction = await Transaction.findOne({
    _id: transactionId,
    userId,
  });

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  await transaction.deleteOne();
  return { message: "Transaction deleted successfully" };
};

module.exports = {
  getTransactions,
  getSummary,
  getMonthlyStats,
  getCategoryStats,
  createTransaction,
  deleteTransaction,
};
