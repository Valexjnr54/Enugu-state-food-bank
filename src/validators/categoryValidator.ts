import { body } from "express-validator";

export const validateCategory = [
  body("name")
    .notEmpty().withMessage("Category name is required.")
    .isString().withMessage("Category name must be a string."),

  body("slug")
    .optional()
    .isString().withMessage("Slug must be a string."),

  body("parentId")
    .optional()
    .isString().withMessage("Parent ID must be a string."),
];
