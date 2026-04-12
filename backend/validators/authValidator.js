const { body } = require("express-validator");

// ─── Shared injection guard ────────────────────────────────────────────────
// Catches SQL injection classics (OR 1=1, --, UNION SELECT, etc.) and
// MongoDB operator injection ($where, $gt, etc.) at the field level.
const SQL_RE =
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|EXECUTE|WHERE|HAVING|SLEEP|BENCHMARK)\b)|(-{2,}|\/\*[\s\S]*?\*\/)|(\'|\")?\s*OR\s+(\'|\")?\s*[\w\d\'"]+\s*=\s*[\w\d\'"]+/gi;
const NOSQL_RE =
  /(\$where|\$gt|\$lt|\$gte|\$lte|\$ne|\$in|\$nin|\$or|\$and|\$regex|\$expr)/i;

const noInjection = (fieldLabel) =>
  (value) => {
    SQL_RE.lastIndex = 0;
    if (SQL_RE.test(value) || NOSQL_RE.test(value)) {
      throw new Error(`${fieldLabel} contains invalid characters or patterns`);
    }
    return true;
  };

const passwordRules = body("password")
  .notEmpty()
  .withMessage("Password is required")
  .isLength({ min: 8 })
  .withMessage("Password is too short — minimum 8 characters required")
  .isLength({ max: 16 })
  .withMessage("Password is too long — maximum 16 characters allowed")
  .matches(/[A-Z]/)
  .withMessage("Password must contain at least one uppercase letter")
  .matches(/[a-z]/)
  .withMessage("Password must contain at least one lowercase letter")
  .matches(/[0-9]/)
  .withMessage("Password must contain at least one number")
  .matches(/[@#$%^&*!?~`\-_+=<>|\\/.,'"`;:()[\]{}]/)
  .withMessage("Password must contain at least one special character");

const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name must contain only alphabets and spaces"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address (e.g. abc@example.com)")
    .normalizeEmail()
    .custom(noInjection("Email")),

  passwordRules,
];

const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail()
    .custom(noInjection("Email")),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .custom(noInjection("Password")),
];

module.exports = { registerValidator, loginValidator };
