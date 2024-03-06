const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const invModel = require("../models/inventory-model")

/*  **********************************
* Classification Data Validation Rules
* ********************************* */
validate.classificationRules = () => {
  return [
    // classification name is required and must be string without leading or trailing spaces
    body("classification_name")
      .trim() // Remove leading and trailing whitespace
      .isLength({ min: 1 })
      .matches(/^[a-zA-Z0-9]*$/).withMessage("Please enter a name without spaces or special characters."), // Only letters, numbers, and spaces allowed 
  ];
};

/* **********************************
* Classification Data Validation: Middleware
* ********************************* */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = []
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
      classification_name,
    })
    return
  }
  next();
}

/*  **********************************
* Inventory Data Validation Rules
* ********************************* */
validate.inventoryRules = () => {
  return [
    // classification_id is required and must be chosen from the list
    body("classification_id")
      .custom(async (value) => {
        const classification = await invModel.getInventoryByClassificationId(value)
        if (!classification) {
          return Promise.reject("Please choose a classification name from the list.")
        }
      }),
    // inventory make is required and must be string
    body("inv_make")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Please provide a make."),
    // inventory model is required and must be string
    body("inv_model")
      .trim()
      .isLength({ min: 2 }) 
      .withMessage("Please provide a model."),
    // inventory description is required and must be string
    body("inv_description")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Please provide a description."),
    // inventory img is required and must be a string
    body("inv_image")
      .trim()
      .isLength({ min: 2})
      .withMessage("Please provide a valid image url."),
    // inventory thumbnail is required and must be a string
    body("inv_thumbnail")
      .trim()
      .isLength({ min: 2})
      .withMessage("Please provide a valid thumbnail url."),
    // inventory price is required and must be a number
    body("inv_price")
      .trim()
      .isNumeric()
      .withMessage("Please provide a price."),
    // inventory year is required and must be a number
    body("inv_year")
      .trim()
      .isNumeric()
      .withMessage("Please provide a year."),
    // inventory miles is required and must be a number
    body("inv_miles")
      .trim()
      .isNumeric()
      .withMessage("Please provide the mileage."),
    // inventory color is required and must be a string
    body("inv_color")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Please provide a color."),
  ]
}

/* **********************************
* Inventory Data Validation: Middleware
* ********************************* */
validate.checkInventoryData = async (req, res, next) => {
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body;
  let errors = []
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const list = await utilities.buildClassificationList(classification_id)
    res.render("inventory/add-inventory", {
      errors,
      title: "Add Inventory",
      nav,
      list,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    })
    return
  }
  next();
}

module.exports = validate;