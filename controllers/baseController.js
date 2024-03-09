const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {firstName: req.session.firstName, title: "Home", nav})
}

module.exports = baseController