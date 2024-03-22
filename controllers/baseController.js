const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {account_firstname: req.session.account_firstname, title: "Home", nav})
  res.locals.isLoggedIn = 0
}

module.exports = baseController