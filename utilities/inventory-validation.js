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

validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  let erros = []
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
// validate.inventoryRules = () => {
//   return [
//     // classification_id is required and must be chosen from the list
//     body("classification_id")
//       .custom(async (value) => {
//         const classification = await invModel.getClassificationById(value)
//         if (!classification) {
//           return Promise.reject("Please provide a valid classification id.")
//         }
//       }),
//     // inventory make is required and must be string
//     body("inv_make")
//       .isLength({ min: 2 })
//       .withMessage("Please provide a name that meets the requirments."), // on error this message is sent.
//     // inventory model is required and must be string
//     body("inv_model")
//       .isLength({ min: 2 })
//       .withMessage("Please provide a name that meets the requirments."), // on error this message is sent.
//     // inventory description is required and must be string
//     body("inv_description")
//       .isLength({ min: 2 })
//       .withMessage("Please provide a description that meets the requirments."), // on error this message is sent.
//     // inventory img is required and must be a string
//     body("inv_image")
//       .isLength({ min: 2})
//       .withMessage("Please provide a valid image url."), // on error this message is sent.
//     // inventory thumbnail is required and must be a string
//     body("inv_thumbnail")
//       .isLength({ min: 2})
//       .withMessage("Please provide a valid thumbnail url."), // on error this message is sent.
//     // inventory price is required and must be a number
//     body("inv_price")
//       .isNumeric()
//       .withMessage("Please provide a valid price."), // on error this message is sent.
//     // inventory year is required and must be a number
//     body("inv_year")
//       .isNumeric()
//       .withMessage("Please provide a valid year."), // on error this message is sent.
//     // inventory miles is required and must be a number
//     body("inv_miles")
//       .isNumeric()
//       .withMessage("Please provide a valid miles."), // on error this message is sent.
//     // inventory color is required and must be a string
//     body("inv_color")
//       .isLength({ min: 2 })
//       .withMessage("Please provide a valid color."), // on error this message is sent.
//   ]
// }

module.exports = validate;