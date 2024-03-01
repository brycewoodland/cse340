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
      .notEmpty().withMessage("Please provide a classification name.")
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
          return Promise.reject("Please provide a valid classification id.")
        }
      }),
    // inventory make is required and must be string
    body("inv_make")
      .notEmpty().withMessage("Please provide a make.")
      .isLength({ min: 2 }),
    // inventory model is required and must be string
    body("inv_model")
      .notEmpty().withMessage("Please provide a model.")
      .isLength({ min: 2 }), 
    // inventory description is required and must be string
    body("inv_description")
      .notEmpty().withMessage("Please provide a description.")
      .isLength({ min: 2 }), 
    // inventory img is required and must be a string
    body("inv_image")
      .notEmpty().withMessage("Please provide a valid image url.")
      .isLength({ min: 2}),
    // inventory thumbnail is required and must be a string
    body("inv_thumbnail")
      .notEmpty().withMessage("Please provide a valid thumbnail url.")
      .isLength({ min: 2}),
    // inventory price is required and must be a number
    body("inv_price")
      .notEmpty().withMessage("Please provide a price.")
      .isNumeric(),
    // inventory year is required and must be a number
    body("inv_year")
      .notEmpty().withMessage("Please provide a year.")
      .isNumeric(),
    // inventory miles is required and must be a number
    body("inv_miles")
      .notEmpty().withMessage("Please provide miles.")
      .isNumeric(),
    // inventory color is required and must be a string
    body("inv_color")
      .notEmpty().withMessage("Please provide a color.")
      .isLength({ min: 2 }),
  ]
}

/* **********************************
* Inventory Data Validation: Middleware
* ********************************* */
validate.checkInventoryData = async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const list = await utilities.buildClassificationList()
    res.render("inventory/add-inventory", {
      errors,
      title: "Add Inventory",
      nav,
      list,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_year: req.body.inv_year,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
    })
    return
  }
  next();
}

module.exports = validate;