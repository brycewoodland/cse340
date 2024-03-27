const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification WHERE classification_approved = true ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1 AND c.classification_approved = true AND i.inv_approved = true`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ****************************************
* Get the individual vehicle data by inv_id
***************************************** */
async function getVehicleDataById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory as i
      WHERE i.inv_id = $1 AND i.inv_approved = true`,
      [inv_id]
    )
    console.log(data.rows[0])
    return data.rows[0];
  } catch (error) {
    console.error("getVehicleData error " + error)
  }
}

/* ****************************************
* Add a classification to the database
***************************************** */
async function addClassification(classification_name) {
  try {
    const data = await pool.query(
      `INSERT INTO public.classification (classification_name, classification_approved) VALUES ($1, $2)`,
      [classification_name, false]
    )
    return data
  } catch (error) {
    console.error("addClassification error " + error)
  }
}

/* ****************************************
* Add a vehicle to the database
***************************************** */
async function addVehicle(classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color) {
  try {
    const data = await pool.query(
      `INSERT INTO public.inventory (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_approved) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, false]
    )
    return data
    } catch (error) {
      return error.message
    }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1';
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    new Error("Delete Inventory Error")
  }
}

/* ***************************
 *  Check if inv item is approved
 * ************************** */
async function approveVehicle(inv_id) {
  try {
    const data = await pool.query(
      `UPDATE public.inventory SET inv_approved = true WHERE inv_id = $1`,
      [inv_id]
    )
    return data
  } catch (error) {
    console.error("approveVehicle error " + error)
  }
}

/* ***************************
 *  Check if classification is approved
 * ************************** */
async function approveClassification(classification_id) {
  try {
    const data = await pool.query(
      `UPDATE public.classification SET is_approved = true WHERE classification_id = $1`,
      [classification_id]
    )
    return data
  } catch (error) {
    console.error("approveClassification error " + error)
  }
}

/* ***************************
 *  Fetch unapproved classifications
 * ************************** */
async function getUnapprovedClassifications() {
  return await pool.query("SELECT * FROM public.classification WHERE classification_approved = false")
}

/* ***************************
 *  Fetch unapproved inventory
 * ************************** */
async function getUnapprovedInventory() {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
      JOIN public.classification AS c ON i.classification_id = c.classification_id
      WHERE i.inv_approved = false`
    )
    return data.rows
  } catch (error) {
    console.error("getUnapprovedInventory error " + error)
  }
}

/* ***************************
*  Approve classification
* ************************** */
async function approveClassification(classification_id) {
  try {
    const data = await pool.query(
      `UPDATE public.classification SET classification_approved = true WHERE classification_id = $1`,
      [classification_id]
    )
    return data
  } catch (error) {
    console.error("approveClassification error " + error)
  }
}

/* ***************************
*  Reject classification
* ************************** */
async function rejectClassification(classification_id) {
  try {
    const data = await pool.query(
      `DELETE FROM public.classification WHERE classification_id = $1`,
      [classification_id]
    ) 
    return data
  } catch (error) {
    console.error("rejectClassification error " + error)
  }
}

/* ***************************
*  Approve inventory
* ************************** */
async function getInventoryDataById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory as i
      WHERE i.inv_id = $1`,
      [inv_id]
    )
    console.log(data.rows[0])
    return data.rows[0];
  } catch (error) {
    console.error("getVehicleData error " + error)
  }
}

/* ***************************
 *  Reject Inventory
 * ************************** */
async function rejectInventory(inv_id) {
  try {
    const data = await pool.query(
      `DELETE FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    )
    return data
  } catch (error) {
    console.error("rejectInventory error " + error)
  }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.classification AS c 
      WHERE c.classification_id = $1 AND c.classification_approved = true`,
      [classification_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 * Check if the Classification is approved
 * ************************** */
async function checkIfApproved(inv_id) {
  try {
    const data = await pool.query(
      `SELECT c.classification_approved
      FROM public.inventory AS i
      JOIN public.classification AS c on i.classification_id = c.classification_id
      WHERE i.inv_id = $1`,
      [inv_id]
    )
      return data.rows[0].classification_approved;
  } catch (error)
  {
    console.error("checkIfApproved error " + error)
  }
}

async function getInventoryItems() {
  try {
    const data = await pool.query(
      `SELECT i.*, c.classification_name
      FROM public.inventory AS i
      JOIN public.classification AS c ON i.classification_id = c.classification_id`
    )
    return data.rows;
  } catch (error) {
    console.error("getInventoryItems error " + error)
  }
}


module.exports = { 
  getClassifications, 
  getInventoryByClassificationId, 
  getVehicleDataById, 
  addClassification, 
  addVehicle, 
  updateInventory, 
  deleteInventory, 
  approveVehicle, 
  approveClassification, 
  getUnapprovedClassifications, 
  getUnapprovedInventory,
  getInventoryDataById,
  getByClassificationId,
  rejectClassification,
  rejectInventory,
  checkIfApproved,
  getInventoryItems
};