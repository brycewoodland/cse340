const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const invModel = require("../models/inventory-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  let isLoggedIn = false;

  if (req.cookies.jwt) {
    try {
      jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);
      isLoggedIn = true;
    } catch (err) {
      console.log(err);
    }
  }
  res.render("account/login", {
    isLoggedIn: isLoggedIn,
    accountData: {
      account_firstname: req.body.account_firstname,
    },
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    isLoggedIn: false,
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, 
          account_lastname, 
          account_email, 
          account_password 
        } = req.body

// Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  console.log(accountData)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
   if(process.env.NODE_ENV === "development") {
    res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
   } else {
    res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
   }
   return res.redirect("/account/",)
   } else {
    req.flash("notice", "Incorrect password or email. Please try again.")
    res.status(400).render("account/login", {
     title: "Login",
     nav,
     errors: null,
     account_email,
    })
   }
  } catch (error) {
   return new Error('Access Forbidden')
  }
 }

/* ****************************************
* Deliver Account Mangement View
* *************************************** */
async function buildManagement(req, res) {
  let nav = await utilities.getNav()
  if (req.cookies.jwt) {
    const payload = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET)
    const account_email = payload.account_email

    const accountData = await accountModel.getAccountByEmail(account_email)
    console.log(accountData)
    res.render("account/management", {
      accountData,
      account_type: accountData.account_type,
      account_id: accountData.account_id,
      title: "Account Management",
      nav,
      errors: null,
    })
  } else {
    res.redirect("/account/login")
  }
}

/* ****************************************
* Logout
* *************************************** */
async function accountLogout(req, res) {
  console.log("Logout function called");
    res.clearCookie('jwt', { httpOnly: true});
    console.log("Redirecting to home page");
    res.redirect('/');
};

/* ****************************************
* Build Update Account View
* *************************************** */
async function buildUpdateAccount(req, res, next) {
  const account_id = req.params.account_id
  let nav = await utilities.getNav()
  const userData = await accountModel.getAccountById(account_id)
  console.log(userData)
  const title = `${userData.account_firstname} ${userData.account_lastname} - Update Account`
  res.render("./account/update", {
    title: title,
    account_id: userData.account_id,
    account_firstname: userData.account_firstname,
    account_lastname: userData.account_lastname,
    account_email: userData.account_email,
    account_type: userData.account_type,
    nav,
    errors: null,
  })
}

/* ****************************************
* Update Account
* *************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email, account_type } = req.body
  console.log(req.body)
  const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email, account_type)

  if (updateResult) { 
    req.body.account_firstname = account_firstname;
    req.flash("notice", "Account updated successfully.")
    const payload = { account_id, account_firstname, account_lastname, account_email, account_type }
    const newToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
    res.cookie("jwt", newToken, { httpOnly: true, maxAge: 3600 * 1000 })
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the account update failed.")
    res.status(501).render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      account_type: account_type,
    })
  }
}

/* ****************************************
* Password Change
* *************************************** */
async function changePassword(req, res, next) {
  let nav = await utilities.getNav()
  const { account_id, account_password } = req.body
  console.log(req.body)
  const hashedPassword = await bcrypt.hashSync(account_password, 10)
  const updateResult = await accountModel.updatePassword(account_id, hashedPassword)

  if (updateResult) { 
    req.flash("notice", "Password changed successfully.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the password change failed.")
    res.status(501).render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      account_type: account_type,
    })
  }
}

async function buildUnapprovedItems(req, res, next) {
  let nav = await utilities.getNav()
  let classifications = await invModel.getUnapprovedClassifications()
  let inventory = await invModel.getUnapprovedInventory()
  const grid = await utilities.buildUnapprovedClassifications(classifications.rows)
  let invGrid = await utilities.buildUnapprovedInventory(inventory.rows)
  res.render("account/unapproved-items", {
    title: "Unapproved Items",
    nav,
    grid,
    invGrid
  })
}

async function buildApproveClassification(req, res, next) {
  let nav = await utilities.getNav()
  const classification_id = req.params.classification_id
  const result = await invModel.getUnapprovedClassifications(classification_id)
  if (result) {
    res.render("account/approve-classification", {
      title: "Approve Classification",
      nav,
      result
    })
  } else {
    req.flash("notice", "Sorry, the classification approval failed.")
    res.redirect("/account/unapproved-items")
  }
}

/* ****************************************
* Approve Classification
* *************************************** */

async function approveClassification(req, res, next) {
  let nav = await utilities.getNav()
  const classification_id = req.params.classification_id
  const result = await invModel.approveClassification(classification_id)
  if (result) {
    req.flash("notice", "Classification approved.")
    res.redirect("/account/unapproved-items")
  } else {
    req.flash("notice", "Sorry, the classification approval failed.")
    res.render("account/unapproved-items", {
      title: "Unapproved Items",
      nav,
      grid,
    })
  }
}

/* ****************************************
* Build Inventory Approval View
* *************************************** */
async function buildInventoryApproval(req, res, next) {
  let nav = await utilities.getNav()
  let inventory = await invModel.getVehicleDataById(req.params.inv_id)
  let vehicleView = await utilities.buildVehicleView(inventory)
  res.render("account/approve-inventory", {
    title: "Inventory Approval",
    nav,
    vehicleView,
    errors: null
  })
}

module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin, 
  buildManagement, 
  accountLogout, 
  buildUpdateAccount, 
  updateAccount, 
  changePassword, 
  buildUnapprovedItems,
  buildApproveClassification,
  approveClassification,
  buildInventoryApproval
 }