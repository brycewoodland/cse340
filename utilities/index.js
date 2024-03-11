const invModel = require("../models/inventory-model")
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
    function (err, firstName) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.firstName = firstName
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
    function (err, firstName) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      res.locals.isLoggedIn = false;
      res.locals.firstName = "";
      return res.redirect("/account/login")
     }
     res.locals.firstName = firstName
     res.locals.isLoggedIn = true;
     next()
    })
  } else {
   req.flash("Please log in")
   res.redirect("/account/login")
  }
 }

module.exports = Util