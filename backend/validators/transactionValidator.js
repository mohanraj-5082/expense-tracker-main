const { body, validationResult } = require("express-validator");

// ─── Allowed Category Lists ────────────────────────────────────────────────
const INCOME_CATEGORIES = [
  "Salary", "Freelance", "Investment", "Business", "Gift", "Other Income",
];
const EXPENSE_CATEGORIES = [
  "Food", "Transport", "Shopping", "Entertainment", "Health",
  "Education", "Utilities", "Rent", "Travel", "Other Expense",
];
const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

// ─── XSS sanitizer: strip HTML/script tags from description ───────────────
const stripHtml = (value) =>
  typeof value === "string"
    ? value.replace(/<[^>]*>/g, "").replace(/[<>"'`]/g, "")
    : value;

// ─── Transaction Validator ─────────────────────────────────────────────────
const transactionValidator = [
  body("type")
    .trim()
    .notEmpty()
    .withMessage("Transaction type is required")
    .isIn(["income", "expense"])
    .withMessage("Transaction type must be 'income' or 'expense'"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isIn(ALL_CATEGORIES)
    .withMessage("Please select a valid category"),

  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be greater than 0")
    .isFloat({ max: 9999999.99 })
    .withMessage("Amount cannot exceed ₹9,999,999.99")
    .custom((value) => {
      const decimals = String(value).split(".")[1];
      if (decimals && decimals.length > 2) {
        throw new Error("Amount can have at most 2 decimal places");
      }
      return true;
    }),

  body("description")
    .optional({ checkFalsy: true })
    .customSanitizer(stripHtml)
    .isLength({ max: 200 })
    .withMessage("Description cannot exceed 200 characters"),

  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Please provide a valid date")
    .custom((value) => {
      const inputDate = new Date(value);
      inputDate.setHours(0, 0, 0, 0);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);
      if (inputDate > tomorrow) {
        throw new Error("Date cannot be in the future");
      }
      return true;
    }),
];

module.exports = { transactionValidator };
