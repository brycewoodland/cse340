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
  let list = '<button class="hamburger-menu" onclick="toggleMenu()">&#9776;</button>'
  list += '<nav id="mobile-menu" class="mobile-menu"><ul>'
  list += '<li><a href="/" title="Home page">Home</a></li>'
  
  for (let row of data.rows) {
    if (row.classification_approved) {
      const inventoryItems = await invModel.getInventoryByClassificationId(row.classification_id)
      // Check if the classification has any approved inventory items
      try {
        if (inventoryItems.some(item => item.inv_approved)) {
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
      } catch (error) {
        console.error(`Failed to process inventory items for classification ${row.classification_id}: ${error.message}`)
      }
    }
  }
  
  list += "</ul></nav>"
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

/* ***********************
* Build unapproved items
* ********************** */
Util.buildUnapprovedClassifications = async function (req, res, next) {
  let classifications = await invModel.getUnapprovedClassifications()
  let table = '<h2 id="classification">Classifications</h2>'
  table += '<table>'
  table += '<tr><th>Name</th><th>Approve</th><th>Reject</th></tr>'
  for (let item of classifications.rows) {
    table += '<tr>'
    table += '<td>' + item.classification_name + '</td>'
    table += '<td><form method="POST" action="/account/approve-classification/' + item.classification_id + '">'
    table += '<input type="submit" value="Approve" class="link-button">'
    table += '</form></td>'
    table += '<td><form method="POST" action="/account/reject-classification/' + item.classification_id + '">'
    table += '<input type="submit" value="Reject" class="link-button">'
    table += '</form></td>'
    table += '</tr>'
  }
  table += '</table>'
  return table;
};

/* ****************************************
* Build the unapproved inventory grid
***************************************** */
Util.buildUnapprovedInventory = async function (req, res, next) {
  let inventory = await invModel.getUnapprovedInventory()
  let invTable = '<h2 id="inventory">Inventory</h2>'
  invTable += '<table>'
  invTable += '<tr><th>Item</th><th>Classification</th><th>Approve</th><th>Reject</th></tr>'
  for (let item of inventory) {
    invTable += '<tr>'
    invTable += '<td>' + item.inv_make + ' ' + item.inv_model + '</td>'
    invTable += '<td>' + item.classification_name + '</td>'
    invTable += '<td><form method="POST" action="/account/approve-inventory/' + item.inv_id + '">'
    invTable += '<input type="submit" value="Approve" class="link-button">'
    invTable += '</form></td>'
    invTable += '<td><form method="POST" action="/account/reject-inventory/' + item.inv_id + '">'
    invTable += '<input type="submit" value="Reject" class="link-button">'
    invTable += '</form></td>'
    invTable += '</tr>'
  }
  invTable += '</table>'
  return invTable;
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