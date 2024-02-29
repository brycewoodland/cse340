const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
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
      WHERE i.classification_id = $1`,
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
      WHERE i.inv_id = $1`,
      [inv_id]
    )
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
      `INSERT INTO public.classification (classification_name) VALUES ($1)`,
      [classification_name]
    )
    return data
  } catch (error) {
    console.error("addClassification error " + error)
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getVehicleDataById, addClassification};