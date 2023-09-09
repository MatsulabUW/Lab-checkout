/**
 * Semin Kim and Dylan Renard
 * CSE 154 AA and AD
 *
 * Final Project MVP
 *
 * Our project is to make a lab equipment checkout page
 * This file contains backend logic for our storefront page
 * Including API endpoints to interact with our DB and error handling
 */

'use strict';

const express = require('express');
const multer = require('multer'); // required to support POST endpoint
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

// const fs = require('fs').promises; // node module to interact with files // debug statement 🐞
const app = express();

const CLNT_ERR = 400; // Client error
const SRVR_ERR = 500; // Server error
const REG_ERR = 19; // Register error

const DEFAULT_PORT = 8000;

// for application /x-www-form-urlencoded
app.use(express.urlencoded({extended: true})); // built-in middleware
// for application/json
app.use(express.json()); // built-in middleware
// for multipart/form-data (required with FormdData)
app.use(multer().none()); // requires the "multer" module


// Given username and passwd, returns user ID or empty result in JSON format
app.post('/index/login', async (req, res) => {
  let username = req.body.username;
  let passwd = req.body.passwd;
  if (!username || !passwd) {
    res.status(CLNT_ERR).type('text')
      .send('Missing one or more of the required params.');
  } else {
    try {
      let db = await getDBConnection();
      let query = 'SELECT * FROM Users WHERE username = ? AND passwd = ?';
      let result = await db.get(query, [username, passwd]);
      res.json(result);
    } catch (err) {
      res.status(SRVR_ERR).type('text')
        .send('An error occurred on the server. Try again later.');
    }
  }
});

// Given username and passwd, adds new user ID
app.post('/index/signin', async (req, res) => {
  let username = req.body.username;
  let passwd = req.body.passwd;
  if (!username || !passwd) {
    res.status(CLNT_ERR).type('text')
      .send('Missing one or more of the required params.');
  } else {
    try {
      let db = await getDBConnection();
      let query = 'INSERT INTO Users(username, is_admin, passwd) VALUES(?, false, ?);';
      let result = await db.run(query, [username, passwd]);
      await db.close();
      res.json(result);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT' && err.errno === REG_ERR) {
        res.status(SRVR_ERR).type('text')
          .send('Username already exists. Please use a different username.');
      } else {

        // console.log(err); // debug statement 🐞
        res.status(SRVR_ERR).type('text')
          .send('An error occurred on the server. Try again later.');
      }
    }
  }
});

/**
 * Get all items data / get specific item data by id
 */
app.get('/items', async (req, res) => {
  let itemType = req.query.itemType; // 'Supplies', 'Equipment'
  let id = req.query.id; // ID of item 'item_id'
  let results = undefined;
  if (!itemType) {
    res.status(CLNT_ERR).type('text')
      .send('Missing one or more of the required params.');
  } else {
    if (!id) {
      results = await getAllItems(itemType);
    } else {
      results = await getItemById(itemType, id);
    }
    if (results === 'An error occurred on the server. Try again later.') {
      res.status(SRVR_ERR).type('text')
        .send('An error occurred on the server. Try again later.');
    } else {
      res.json({items: results});
    }
  }
});

/**
 * Get the checkout information
 */
app.get('/inventory/checkout', async (req, res) => {
  let itemType = req.query.itemType; // 'Supplies', 'Equipment'
  let itemId = req.query.itemId; // ID of item 'item_id'
  let userId = req.query.userId;
  let inputVal = req.query.inputVal;
  if (!itemId || !userId || !inputVal) {
    res.status(CLNT_ERR).type('text')
      .send('Missing one or more of the required params.');
  } else {
    try {
      let itemInfo = await getItemById(itemType, itemId);
      let result1 = undefined;
      let result2 = undefined;
      if (itemType === 'Supplies') {
        result1 = updateSupplies(itemId, inputVal, itemInfo);
        if (result1 === 1) { // 1 if update was successful, 0 or error statement else
          result2 = addSupplyHistory(userId, itemId, inputVal);
        }
      } else {
        result1 = updateEquipment(itemId, itemInfo);
        if (result1 === 1) {
          result2 = addEquipmentHistory(userId, itemId, inputVal);
        }
      }
      if (result2 !== 1) {
        res.status(SRVR_ERR).type('text')
        .send('Could not add checkout information to the history. Try again later.');
      }
    } catch (err) {
      res.status(SRVR_ERR).type('text')
          .send('An error occurred on the server. Try again later.');
    }
  }
});

/**
 * Get history
 */
app.get('/inventory/history', async (req, res) => {
  try {
    let db = await getDBConnection();
    let query = 'SELECT * FROM Checkout';
    let results = await db.all(query);
    res.json(results);
  } catch (err) {
    res.status(SRVR_ERR).type('text')
        .send('An error occurred on the server. Try again later.');
  }
});

/**
 * getAllItems:
 * One sentence Description
 * @param {*} itemType - what is this variable
 * @returns {String} what do we return?
 */
async function getAllItems(itemType) {
  try {
    let db = await getDBConnection();
    let query = 'SELECT * FROM ' + itemType;
    let results = await db.all(query);
    await db.close();
    return results;
  } catch (err) {
    return 'An error occurred on the server. Try again later.';
  }
}

/**
 * getItemById
 * one sentence Description
 * @param {*} itemType - What does this variable represent?
 * @param {*} id - What does this variable represent?
 * @returns {String} What do we return?
 */
async function getItemById(itemType, id) {
  try {
    let db = await getDBConnection();
    let query = 'SELECT * FROM ' + itemType + ' WHERE item_id = ?';
    let results = await db.all(query, id);
    await db.close();
    return results;
  } catch (err) {
    return 'An error occurred on the server. Try again later.';
  }
}

async function equipmentFilter(availabilities, types) {
  try {
    let db = await getDBConnection();
    let query = 'SELECT * FROM Equipment'

    // add logic for adding availabilities to the equipment filter
    if (availabilities.length === 1) {
      query = query + " WHERE item_status = ?";
    }

    if (types.length > 0) {
      let start = 0;
      if (availabilities.length === 0 || availabilities.length === 2) {
        start = 1;
        query = query + " WHERE type_ = ?";
      } // add logic for adding types to equipment filter
      for (let i = start; i < types.length; i ++) {
        query += " AND type_ = ?";
      }
    }

    // decide results accordingly

    let results = await db.all(query, id);
    await db.close();
    return results;
  } catch (err) {
    return 'An error occurred on the server. Try again later.';
  }
}

async function supplyFilter(availabilitym, ) {
  try {
    let db = await getDBConnection();
    let query = 'SELECT * FROM ' + itemType + ' WHERE item_id = ?';
    let results = await db.all(query, id);
    await db.close();
    return results;
  } catch (err) {
    return 'An error occurred on the server. Try again later.';
  }
}

async function updateEquipment(itemId, itemInfo){
  let avail_boo = itemInfo[0].item_status;
  console.log(avail_boo);
  if (avail_boo === false) {
    return "Equipment you want is not available";
  }
  try {
    let db = await getDBConnection();
    let query = "UPDATE Equipment Set item_status = false WHERE item_id = ?";
    let result = await db.run(query, itemId);
    await db.close();
    console.log(result);
    return result.changes;
  } catch(err) {
    return 'An error occurred on the server. Try again later.';
  }
}

async function updateSupplies(itemId, inputVal, itemInfo) {
  let currStock = itemInfo[0].num_in_stock;
  console.log(currStock);
  let quantity = inputVal;
  let updatedStock = currStock - quantity;
  if(updatedStock <= 0) {
    return "There is not enough stock for the quantity you desire";
  }
  try {
    let db = await getDBConnection();
    // update supplies
    let query = "UPDATE Supplies Set num_in_stock = ? WHERE item_id = ?";
    let result = await db.run(query, [updatedStock, itemId]);
    await db.close();
    return result.changes;
  } catch(err) {
    return 'An error occurred on the server. Try again later.';
  }
}

async function addEquipmentHistory(userId, itemId, inputVal) {
  try {
    let db = await getDBConnection();
    let query = 'INSERT INTO Checkout(user_id, e_id, checkout_duration)' +
    ' VALUES(?, ?, ?);';
    let result = await db.run(query, [userId, itemId, inputVal]);
    console.log(result);
    await db.close();
    return result.changes;
  } catch(err) {
    return 'Could not update History. Try again later.';
  }
}

async function addSupplyHistory(userId, itemId, inputVal) {
  try {
    let db = await getDBConnection();
    let query = 'INSERT INTO Checkout(user_id, s_id, checkout_amount)' +
    ' VALUES(?, ?, ?);';
    let result = await db.run(query, [userId, itemId, inputVal]);
    console.log('history change: ' + result);
    await db.close();
    console.log(result);
    return result.changes;
  } catch(err) {
    console.log(err);
    return 'Could not update History. Try again later.';
  }
}

/**
 * Establishes a database connection to the database and returnst the database object.
 * Any erros that occur should be caught in the function that calls this one.
 * @returns {sqlite3.Database} - The database object for the connection
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'lab.db',
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static('public'));
const PORT = process.env.PORT || DEFAULT_PORT;
app.listen(PORT);