import { body } from "express-validator";

export const validateAddress = [
  body("label")
    .notEmpty().withMessage("Label is required")
    .isIn(["Home", "Office", "Other"]).withMessage("Label must be 'Home', 'Office', or 'Other'"),

  body("street")
    .notEmpty().withMessage("Street is required"),

  body("city")
    .notEmpty().withMessage("City is required"),

  body("state")
    .notEmpty().withMessage("State is required"),

  body("country")
    .notEmpty().withMessage("Country is required"),

  body("zipCode")
    .optional()
    .isPostalCode("any").withMessage("Zip code must be a valid postal code"),
];
