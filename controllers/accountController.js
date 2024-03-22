const utilities = require("../utilities")
const accountModel = require("../models/account-model")
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
    firstName: req.session.firstName,
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
    isLoggedIn: false,
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
   req.session.isLoggedIn = true
   req.session.firstName = accountData.account_firstname
   req.session.account_email = accountData.account_email
   return res.redirect("/account/",)
   } else {
    req.flash("notice", "Incorrect password. Please try again.")
    res.status(400).render("account/login", {
     isLoggedIn: false,
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
  const account_email = req.session.account_email
  if (req.session.isLoggedIn) {
    const accountData = await accountModel.getAccountByEmail(account_email)
    console.log(accountData)
    req.session.firstName = accountData.account_firstname
    res.render("account/management", {
      firstName: req.session.firstName,
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
function accountLogout(req, res) {
  console.log("Logout function called");
  req.session.destroy(err => {
    if(err) {
      console.log("Error : Failed to destroy the session during logout.", err);
    }
    res.clearCookie('jwt');
    console.log("Redirecting to home page");
    res.redirect('/');
  });
};

/* ****************************************
* Build Update Account View
* *************************************** */
async function buildUpdateAccount(req, res, next) {
  const account_id = req.params.account_id
  let nav = await utilities.getNav()
  const userData = await accountModel.getAccountById(account_id)
  const title = `${userData.account_firstname} ${userData.account_lastname} - Update Account`
  res.render("./account/update", {
    title: title,
    firstName: userData.account_firstname,
    account_id: userData.account_id,
    account_firstname: userData.account_firstname,
    account_lastname: userData.account_lastname,
    account_email: userData.account_email,
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
  const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email)

  if (updateResult) { 
    req.flash("notice", "Account updated successfully.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the account update failed.")
    console.log(account_id)
    res.status(501).render("account/management", {
      title: "Account Management",
      nav,
      firstName: account_firstname,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
      account_type,
    })
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildManagement, accountLogout, buildUpdateAccount, updateAccount }