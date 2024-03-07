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
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    classificationSelect,
  });
}

/* ****************************************
 *  Deliver Add Classification view
 * *************************************** */
invCont.buildClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  });
}

/* ****************************************
*  Process Add Classification view
* *************************************** */
invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body

  const result = await invModel.addClassification(classification_name)

  if (result) {
    req.flash("notice", "Classification added successfully.")
    res.status(201).redirect("/inv")
  } else {
    req.flash("notice", "Sorry, there was an error adding the classification.")
    res.status(501).render("/inv/add-classification", {
      title: "Add Classification",
      nav,
    })
  }
}

/* ****************************************
 *  Deliver Add Inventory view
 * *************************************** */
invCont.buildInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const list = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    list,
    errors: null,
  });
}

/* ****************************************
 *  Process Add Inventory view
 * *************************************** */
invCont.addInventory = async function (req, res) {
  let nav = await utilities.getNav();
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  } = req.body

  const result = await invModel.addVehicle(
    classification_id, 
    inv_make, 
    inv_model, 
    inv_description, 
    inv_image, 
    inv_thumbnail, 
    inv_price, 
    inv_year, 
    inv_miles, 
    inv_color
    )

  if (result) {
    req.flash("notice", "Vehicle added successfully to the inventory.")
    res.status(201).redirect("/inv")
  } else {
    req.flash("notice", "Sorry, there was an error adding the vehicle to the inventory.")
    res.status(501).render("/inv/add-inventory", {
      title: "Add Inventory",
      nav,
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

module.exports = invCont