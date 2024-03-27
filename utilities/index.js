const invModel = require("../models/inventory-model")
const accountModel = require("../models/account-model")
const Util = {}
const jwt = require('jsonwebtoken')
require('dotenv').config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = '<ul>'
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    if (row.is_approved) {
    list += "<li>"
      list +=
        '<a href="/inv/type/' +
        row.classification_id +
        '" title="See our inventory of ' +
        row.classification_name +
        ' vehicles">' +
        row.classification_name +
        "</a>"
      list += "</li>"
    }
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the individual vehicle view HTML
* ************************************ */
Util.buildVehicleView = async function (data) {
  let grid = '<div class="vehicle">';
  grid += '<h2>' + data.inv_year + ' ' + data.inv_make + ' ' + data.inv_model + '</h2>';
  grid += '<img src="' + data.inv_image + '" alt="Image of ' +
    data.inv_make + ' ' + data.inv_model + ' on CSE Motors" />';
  grid += '<div class="vehicleInfo">';
  grid += '<p><strong>Price:</strong> $' +
    new Intl.NumberFormat('en-US').format(data.inv_price) + '</p>';
  grid += '<p><strong>Mileage: </strong>' + 
    new Intl.NumberFormat('en-Us').format(data.inv_miles) + '</p>';
  grid += '<p><strong> Color: </strong> ' + data.inv_color + '</p>';
  grid += '<p><strong> Description: </strong>' + data.inv_description + '</p>';
  grid += '</div></div>';
  return grid;
};

/* **********************
* Build unapproved items
* ********************* */
Util.buildUnapprovedClassifications = async function (req, res, next) {
  let nav = await Util.getNav()
  let classifications = await invModel.getUnapprovedClassifications()
  let grid = '<h2 id="classification">Classifications</h2>'
  grid += '<div class="grid=container">'
  for (let item of classifications.rows) {
    grid += '<div class="grid-item">'
    grid += '<h2>' + item.classification_name + '</h2>'
    grid += '<a href="/account/approve-classification/' + item.classification_id + '">Approve</a>'
    grid += '                  '
    grid += '<a href="/account/delete-classification/' + item.classification_id + '"> Reject</a>'
    grid += '</div>'
  }
  grid += '</div>'
  return grid;
};

/* ****************************************
* Build the unapproved inventory grid
***************************************** */
Util.buildUnapprovedInventory = async function (req, res, next) {
  let nav = await Util.getNav()
  let inventory = await invModel.getUnapprovedInventory()
  let invGrid = '<h2 id="inventory">Inventory</h2>'
  invGrid += '<div class="grid-container">'
  for (let item of inventory.rows) {
    invGrid += '<div class="grid-item">'
    invGrid += '<h2>' + item.inv_make + ' ' + item.inv_model + '</h2>'
    invGrid += '<a href="/account/approve-vehicle/' + item.inv_id + '">Approve</a>'
    invGrid += '                  '
    invGrid += '<a href="/account/delete-vehicle/' + item.inv_id + '"> Reject</a>'
    invGrid += '</div>'
  }
  invGrid += '</div>'
  return invGrid;
};
  

/* ************************************************
* Build the drop down for classification of vehicle
* *********************************************** */
Util.buildClassificationList = async function (classification_id) {
  let data = await invModel.getClassifications();
  let list = '<select name="classification_id" id="classificationList" required>'
  list += '<option value="">Choose a Classification</option>'
  data.rows.forEach((row) => {
    let selected = '';
    if (classification_id && row.classification_id.toString() === classification_id.toString()) {
      selected = 'selected';
    }
    list += '<option value="' + row.classification_id + '"' + selected + '>' + row.classification_name + '</option>'
  });
  list += '</select>'
  return list
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
 
/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.isLoggedIn = 1
     next()
    })
  } else {
   next()
  }
 }

/* ****************************************
* Middleware to check login
**************************************** */
Util.checkLogin = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      async function (err, decoded) {
        if (err) {
          req.flash("notice", "Please log in")
          res.locals.isLoggedIn = 0;
          res.locals.accountData = { account_firstname: "" };
          return res.redirect("/account/login")
        }
        // Fetch account data using the account email from the decoded JWT
        const accountData = await accountModel.getAccountByEmail(decoded.account_email)
        // Set res.locals values
        res.locals.isLoggedIn = 1;
        res.locals.accountData = accountData;
        next()
      })
  } else {
    req.flash("notice", "Please log in")
    res.locals.isLoggedIn = 0;
    res.locals.accountData = { account_firstname: "" };
    res.redirect("/account/login")
  }
}

/* ****************************************
* Middleware to check admin or employee
**************************************** */
Util.checkAccountType = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    async function (err, decodedToken) {
      if (err) {
        req.flash("notice", "Please log in to access this page.")
        res.redirect("/account/login")
      } else {
          console.log('decodedToken:', decodedToken)
          console.log('decodedToken.email:', decodedToken.account_email)
          const accountData = await accountModel.getAccountByEmail(decodedToken.account_email);
          console.log(accountData);
          if (accountData.account_type === "Employee" || accountData.account_type === "Admin") {
            next();
        } else {
            req.flash("notice", "Please log in to access this page.")
            res.redirect("/account/login")
        }
      }
    })
  }
}

module.exports = Util