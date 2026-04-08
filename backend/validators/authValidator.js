const { body } = require("express-validator");

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
    .normalizeEmail(),

  passwordRules,
];

const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = { registerValidator, loginValidator };
