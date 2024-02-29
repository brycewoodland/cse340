// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController");
const { handleErrors } = require("../utilities");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build individual vehicle view
router.get("/detail/:invId", invController.buildVehicleById);

// Route to build management view
router.get("/", invController.buildManage);

// Route to build add-classification view
router.get("/add-classification", invController.addClassification);

module.exports = router;