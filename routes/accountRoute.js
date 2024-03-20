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
router.get("/", utilities.handleErrors(accountController.buildManagement))

// Logout
router.get('/logout', accountController.accountLogout)

//Update Account
router.get('/update/:account_id', utilities.handleErrors(accountController.buildUpdateAccount))

// Update Account
router.post('/update', regValidate.updateRules(), regValidate.checkUpdateData, utilities.handleErrors(accountController.updateAccount))

// Change Password
router.post('/update', regValidate.registrationRules(), utilities.handleErrors(accountController.updateAccount))

module.exports = router