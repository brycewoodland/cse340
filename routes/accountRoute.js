const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))
router.post("/register", regValidate.registrationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount))

// Process the login attempt
router.post("/login", regValidate.loginRules(), regValidate.checkLoginData, utilities.handleErrors(accountController.accountLogin))

// Default route
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))

// Logout
router.get('/logout', accountController.accountLogout)

//Update Account
router.get('/update/:account_id', utilities.handleErrors(accountController.buildUpdateAccount))

// Update Account
router.post('/update/', utilities.checkLogin, regValidate.updateDetailRules(), regValidate.checkUpdateData, utilities.handleErrors(accountController.updateAccount))

// Change Password
router.post('/update-password/', regValidate.registrationRules(), utilities.handleErrors(accountController.changePassword))

// Unapproved Items
router.get('/unapproved-items', utilities.checkLogin, utilities.handleErrors(accountController.buildUnapprovedItems))

// Approve Classification 
router.post('/approve-classification/:classification_id', utilities.checkLogin, utilities.handleErrors(accountController.approveClassification))

// Reject Classification
router.post('/reject-classification/:classification_id', utilities.checkLogin, utilities.handleErrors(accountController.rejectClassification))

// Approve Inventory
router.post('/approve-inventory/:inv_id', utilities.checkLogin, utilities.handleErrors(accountController.approveInventory))

// Reject Inventory
router.post('/reject-inventory/:inv_id', utilities.checkLogin, utilities.handleErrors(accountController.rejectInventory))

module.exports = router