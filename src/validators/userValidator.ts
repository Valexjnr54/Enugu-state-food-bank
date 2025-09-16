import { body } from "express-validator";

export const validateUser = [
  body("firstname").notEmpty().withMessage("First name is required"),
  body("lastname").notEmpty().withMessage("Last name is required"),
  body("email")
  .optional({ nullable: true, checkFalsy: true }) // accept null, "", or undefined
  .isEmail().withMessage("Invalid email address"),

  body("phone")
    .optional({ nullable: true, checkFalsy: true }) // accept null, "", or undefined
    .isMobilePhone("any").withMessage("Invalid phone number"),
  body("level").notEmpty().withMessage("Level is required"),
  body("employee_id").notEmpty().withMessage("Employee ID is required"),
  body("verification_id").notEmpty().withMessage("Verification Number is required"),
  body("government_entity").notEmpty().withMessage("Government entity is required"),
  body("salary_per_month")
    .notEmpty().withMessage("Salary is required")
    .isFloat({ gt: 0 }).withMessage("Salary must be a positive number"),
];
