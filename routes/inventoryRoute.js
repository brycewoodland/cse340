// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController");
const { handleErrors } = require("../utilities");
const utilities = require("../utilities");
const validate = require("../utilities/inventory-validation");

// Route to build inventory by classification view
router.get("/type/:classificationId", handleErrors(invController.buildByClassificationId));

// Route to build individual vehicle view
router.get("/detail/:invId", handleErrors(invController.buildVehicleById));

// Route to build management view
router.get("/", utilities.checkLogin, utilities.checkAccountType, handleErrors(invController.buildManage));

// Route to build add-classification view
router.get("/add-classification", utilities.checkLogin, handleErrors(invController.buildClassification));

// Route to post add-classification view
router.post('/add-classification', utilities.checkLogin, validate.classificationRules(), validate.checkClassificationData, handleErrors(invController.addClassification));

// Route to build add-inventory view
router.get("/add-inventory", utilities.checkLogin, handleErrors(invController.buildInventory));

// Route to post add-inventory view
router.post("/add-inventory", utilities.checkLogin, validate.inventoryRules(), validate.checkInventoryData, handleErrors(invController.addInventory));

// Route to build edit-inventory view
router.get("/getInventory/:classification_id", utilities.checkLogin, handleErrors(invController.getInventoryJSON));

// Route to edit-inventory view
router.get("/edit/:invId", utilities.checkLogin, handleErrors(invController.buildEditInventory));

// Route to post edit-inventory view
router.post("/update/", utilities.checkLogin, validate.inventoryRules(), validate.checkUpdateData, handleErrors(invController.updateInventory))

// Route to delete inventory
router.get("/delete/:invId", utilities.checkLogin, handleErrors(invController.deleteInventory));

// Route to post delete inventory
router.post("/delete/", utilities.checkLogin, handleErrors(invController.deleteInventoryPost));

module.exports = router;