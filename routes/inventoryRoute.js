// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController");
const { handleErrors } = require("../utilities");
const validate = require("../utilities/inventory-validation");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build individual vehicle view
router.get("/detail/:invId", invController.buildVehicleById);

// Route to build management view
router.get("/", invController.buildManage);

// Route to build add-classification view
router.get("/add-classification", invController.buildClassification);

// Route to post add-classification view
router.post('/add-classification', validate.classificationRules(), validate.checkClassificationData, invController.addClassification);

// Route to build add-inventory view
router.get("/add-inventory", invController.buildInventory);

// Route to post add-inventory view
// router.post("/add-inventory", validate.inventoryRules(), invController.addInventory);

module.exports = router;