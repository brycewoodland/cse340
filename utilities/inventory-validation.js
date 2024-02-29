const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const invModel = require("../models/inventory-model")

/*  **********************************
* Classification Data Validation Rules
* ********************************* */
validate.classificationRules = () => {
  return [
    // classification name is required and must be string
    body("classification_name")
      .isLength({ min: 2 })
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("Please provide a classification name that meets the requirments."), // on error this message is sent.
  ]
}

module.exports = validate;