const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
    })
  }

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
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

/* ****************************
* Process Login
**************************** */
async function processLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  try {
    const user = await accountModel.loginAccount(account_email)

    if (user && bcrypt.compareSync(account_password, user.account_password)) {
      req.flash("notice", "Successfully logged in.")
      res.status(200).render("account/login", { 
        title: "Login",
        nav,
      })
    } else {
      req.flash("notice", "Invalid email or password.")
      res.status(401).render("account/login", {
        title: "Login",
        nav,
      })
    }
  } catch (error) {
    req.flash("notice", "An error occurred while logging in.")
    res.status(500).render("account/login", {
      title: "Login",
      nav,
    })
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, processLogin }