import { body } from "express-validator";

export const validateCashier = [
  body("firstname").notEmpty().withMessage("First name is required"),
  body("lastname").notEmpty().withMessage("Last name is required"),
  body("email")
  .notEmpty().withMessage("Email Address is required") // accept null, "", or undefined
  .isEmail().withMessage("Invalid email address"),
  body('username').notEmpty().withMessage('Username is reqired'),
];
