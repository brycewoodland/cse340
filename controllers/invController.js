const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " Vehicles",
    nav,
    grid,
  })
}

/* ****************************************
 * Build individual vehicle view
 * **************************************** */
invCont.buildVehicleById = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getVehicleDataById(inv_id)
  const grid = await utilities.buildVehicleView(data)
  let nav = await utilities.getNav()
  const title = data.inv_make + " " + data.inv_model
  res.render("./inventory/vehicle", {
    title: title,
    nav,
    grid,
  })
}

/* ****************************************
 *  Deliver Manage view
 * *************************************** */
invCont.buildManage = async function (req, res, next) { 
  let nav = await utilities.getNav();
  req.flash("info", "Welcome to the Vehicle Management page")
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
  });
}

module.exports = invCont