## Semin Kim and Dylan Renard
## CSE 154 Section AA and AD
## May 12th 2023

# LabCheckout API Documentation
Create a Javascript Wrapper class to call several of the functions
we plan to implement for users:
* takeout supplies
* checkout information
* update product information
* this javascript wrapper class code will be hosted and called on by API requests

## GolgiAparatus.incorporrated
**Request Informations with examples:**
    [GET] get information to load information on the website and apply search filters
      [Parameters]
        ?type (string) = equipments
                       = supplies
        ?id = id of the equipment / supply
        ?action = getCategory
                = getReservationList
      [Returns] JSON
    [POST] add / delete new tools, update status (availability, reservation, etc)
      [Parameters]
        ?type (string) = equipments
                       = supplies
        ?id = id of the equipment / supply
        ?action = addNew
                = delete
                = reserve (from / until)
                = update
                = takeOut
      [Returns] JSON

**Description:** handles Database calls to the microsoft azure server
    - creating a new supply / equipment
    - creating a new reservation
    - updating stock / availability information

**Example Response:**

```json
{
  [
    {
    item name: "Thermo Fischer beaker 500mL",
    item_descrip: "a very large beaker",
    last_updated: 5/12/2023,
    num_in_stock 10,
    unit_size: 500mL,
    item_location: Fridge drawer 201,
    location_descrip: On the lab bench on the right of the fridge,
    min_stock_replen: 3
    },
    {1},
    ....,
    {N}
  ]
}
```

**Error Handling:**

- Server side errors
  - If the item is out of stock or at low stock the program will throw an error
    preventing the user from checking out the supplies. Returns error message:
    {error: "No Supplies found"}
  - Same for if the equipment is not available for checkout.
- Client side errors
  - If the requst parameters are missing, client side error occurrs and returns
    error message: {error: "invalid request"}



# Backend Proposal
Implement Several Databases using the following schema
using a Microsoft Azure Server:
-- Equipment Tables

-- Equipment Catalog
-- Used by research users to log in/out equipment
CREATE TABLE Equipment (
  catalog_num varchar(100) PRIMARY KEY,
  gen_item_name varchar(100), -- maps to general name in spreadsheet
  specific_item_name varchar(150),
  item_room varchar(50),
  item_location_descrip varchar(100),
  item_status BOOLEAN FOREIGN KEY REFERENCES Checkout(item_status)  -- string determines if an item is checked out
);

-- Equipment Appointment table
-- Table in charge of actually handling scheduling equiquipment checkout duration
CREATE TABLE Checkout (
  catalog_num varchar(100) PRIMARY KEY,
  item_status BOOLEAN PRIMARY KEY,
  last_checkout_date DATETIME,
  checkout_duration INT,
  checkout_due_by DATETIME,
);

-- Equipment Financials
-- only accessible to admin accounts to look at current inventory levels
CREATE TABLE Equipment_financials (
  catalog_num varchar(100) FOREIGN KEY REFERENCES Equipment(catalog_num),
  Vendor varchar(100),
  price float,
  funds_used varchar(100),
  Model_number varchar(100),
  Serial_number varchar(100),
  order_num varchar(100)
);


-- Supplies Table
-- used so people can take out supplies from the shared inventory
CREATE TABLE Supplies (
  item_name varchar(100),
  item_descrip varchar(150),
  last_updated DATE FOREIGN KEY REFERENCES Resupply(last_updated),
  num_in_stock INT FOREIGN KEY REFERENCES Resupply(num_in_stock),
  unit_size VARCHAR(25),
  item_location VARCHAR(100),
  location_descrip VARCHAR(50),
  min_stock_replen INT FOREIGN KEY REFERENCES Resupply(min_stock_replen)
);


-- Resupply Table
-- keeps track of current inventory levels
-- and other admin information
CREATE TABLE Resupply (
  item_name VARCHAR(100),
  num_in_stock INT PRIMARY KEY,
  min_stock_replen INT,
  price FLOAT,
  order_num VARCHAR(25),
  added_by VARCHAR(50),
  last_updated DATE PRIMARY KEY,
  Expiration_date DATETIME,
  Notes VARCHAR(250),
);