-- Dylan Renard and Semin Kim
-- CSE 154 Final Data Base Schema
-- This file contains the database schema
-- for several of our tables that our API will handle


-- User log
-- My page keeps history of checkouts
CREATE TABLE Users
(
  user_id INTEGER PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  passwd VARCHAR(100) NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO Users
  (username, is_admin, passwd)
VALUES('user1', false, 1234);
INSERT INTO Users
  (username, is_admin, passwd)
VALUES('user2', false, 1234);


-- Equipment Tables

-- Equipment Catalog
-- Used by research users to log in/out equipment
CREATE TABLE Equipment
(
  item_id INTEGER PRIMARY KEY,
  item_name VARCHAR(100),
  item_descrip VARCHAR(1000),
  image_url VARCHAR(3000),
  type_ VARCHAR(100),
  item_status VARCHAR(100),
  booking_starts DATETIME DEFAULT CURRENT_TIMESTAMP,
  booking_ends DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CREATE TABLE History (
--   transaction_id INTEGER PRIMARY KEY,
--   username VARCHAR(100);
-- )

-- Example Equipments

INSERT INTO Equipment
  (item_name, item_descrip, image_url, type_, item_status, booking_starts, booking_ends)
VALUES
  ('Incubator (top)', 'INCUBATOR 2 STACK CO2 UV 5.8 115V PROM', 'https://us.vwr.com/stibo/bigweb/std.lang.all/01/62/28810162.jpg', 'Cell Culture', 'available', NULL, NULL),
  ('Incubator (bottom)', 'INCUBATOR 2 STACK CO2 UV 5.8 115V PROM', 'https://us.vwr.com/stibo/bigweb/std.lang.all/01/62/28810162.jpg', 'Cell Culture', 'broken', NULL, NULL),
  ('Liquid Nitrogen Dewar Name TBD', 'IC Biomedical LS750 LabSystem Cryostorage Unit (with rack, without boxes)\nTaylor Wharton Roller Base for LS750, HC34, HC35, VHC35, XT34, LD35, & LD50 Series', 'https://princetoncryo.com/media/catalog/product/cache/3bf951dafef104ce0bd19f20c4dc3ebf/5/l/5ldewar-opt_1.jpg', 'Others', 'in-use', '2023-05-01 12:00:00', '2023-05-30 12:00:00'),
  ('Frida Freezer -80C', 'phcbi ultra-low temperature freezer', 'https://www.selectscience.net/images/products/9989_phc2.jpg', 'Fridge', 'available', NULL, NULL),
  ('Polar Poirot -20C', '', 'https://assets.fishersci.com/TFS-Assets/CCG/Thermo-Scientific/product-images/223432801.jpg-650.jpg', 'Fridge', 'available', NULL, NULL),
  ('Dalí Deli 4C', 'Glass door fridge', 'https://us.vwr.com/stibo/bigweb/std.lang.all/69/40/36936940.jpg', 'Fridge', 'maintenance', '2023-07-01 12:00:00', '2023-10-10 12:00:00'),
  ('Underbench 4C Name TBD', 'Fisherbrand Isotemp Undercounter BOD Refrigerated Incubator', 'https://assets.fishersci.com/TFS-Assets/CCG/product-images/F19491~p.eps-650.jpg', 'Fridge', 'in-use', '2023-05-01 12:00:00', '2023-06-30 12:00:00'),
  ('Underbench -20C Name TBD', 'VWR Standard Series Free Standing Undercounter Refrigerator and Freezer, Manual Defrost', 'https://cdn2.bigcommerce.com/n-ww20x/1dopwv/products/309/images/1975/MV4-2UCRDA__58473.1670602434.1280.1280.png?c=2', 'Fridge', 'broken', NULL, NULL);


-- Equipment Appointment table
-- Table in charge of actually handling scheduling equiquipment checkout duration
CREATE TABLE Checkout
(
  checkout_id INTEGER PRIMARY KEY,
  user_id INTEGER,
  e_id INTEGER,
  s_id INTEGER,
  checkout_duration INTEGER,
  -- Equipment
  checkout_amount INTEGER,
  -- Supply
  checkout_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
  FOREIGN KEY (e_id) REFERENCES Equipment(item_id),
  FOREIGN KEY (s_id) REFERENCES Supplies(item_id)
);

-- Supplies Table
-- used so people can take out supplies from the shared inventory
CREATE TABLE Supplies
(
  item_id INTEGER PRIMARY KEY,
  item_name varchar(100),
  item_descrip varchar(1000),
  category VARCHAR(100),
  image_url VARCHAR(3000),
  expire DATETIME,
  num_in_stock INTEGER
);

--------- Example supplies insert
INSERT INTO Supplies
  (item_name, item_descrip, category, image_url, expire, num_in_stock)
VALUES
  ('DMEM/F-12, no phenol red', 'DMEM/F-12, no phenol red', 'Stem Cell Supplies', 'https://www.thermofisher.com/TFS-Assets/BID/product-images/21041025_650x600.jpg-650.jpg', '2023-01-25 12:00:00', 3);

INSERT INTO Supplies
  (item_name, item_descrip, category, image_url, expire, num_in_stock)
VALUES
  ('Trypsin-EDTA (0.05%), phenol red', 'Trypsin-EDTA (0.05%), phenol red', 'Stem Cell Supplies', 'https://www.thermofisher.com/TFS-Assets/BID/product-images/25300062_650x600.jpg-650.jpg', '2023-10-25 12:00:00', 3);

INSERT INTO Supplies
  (item_name, item_descrip, category, image_url, expire, num_in_stock)
VALUES
  ('mTeSR Plus Basal Medum', 'mTeSR Plus Basal Medum', 'Media', 'https://www.stemcell.com/media/catalog/product/0/5/05825-product-1_3.jpg', '2023-04-25 12:00:00', 10);

INSERT INTO Supplies
  (item_name, item_descrip, category, image_url, expire, num_in_stock)
VALUES
  ('MTESR Plus 5x Supplement', 'MTESR Plus 5x Supplement', 'Media', 'https://www.stemcell.com/media/catalog/product/8/5/85850-product-1_1.jpg', '2023-01-25 12:00:00', 10);

INSERT INTO Supplies
  (item_name, item_descrip, category, image_url, expire, num_in_stock)
VALUES
  ('RevitaCell', 'Gibco RevitaCell Supplement (100X)', 'Stem Cell Supplies', 'https://www.thermofisher.com/TFS-Assets/LSG/product-images/15140-122_650x600.jpg-650.jpg', '2024-03-31T12:00:00', 2);

INSERT INTO Supplies
  (item_name, item_descrip, category, image_url, expire, num_in_stock)
VALUES
  ('Tryple', 'Tryple Express Enzyme (1X), no phenol red', 'Stem Cell Supplies', 'https://www.thermofisher.com/order/catalog/product/12604039', '2024-01-25 12:00:00', 2);

INSERT INTO Supplies
  (item_name, item_descrip, category, image_url, expire, num_in_stock)
VALUES
  ('Geltrex', 'Geltrex LDEV-Free, hESC-Qualified, Reduced Growth Factor Basement Membrane Matrix', 'Stem Cell Supplies', 'https://www.thermofisher.com/TFS-Assets/CCG/product-images/F260228~p.eps-650.jpg', '2024-01-25 12:00:00', 3);

INSERT INTO Supplies
  (item_name, item_descrip, category, image_url, expire, num_in_stock)
VALUES
  ('Pbs, pH 7.4', 'Pbs, pH 7.4', 'Media', 'https://www.thermofisher.com/TFS-Assets/BID/product-images/10010031_PBS_1X_1000ML_R1_650x600.jpg-650.jpg', '2023-01-25 12:00:00', 14);

INSERT INTO Supplies
  (item_name, item_descrip, category, expire, num_in_stock, image_url)
VALUES
  ('CloneR2', 'CloneR2 description', 'Stem Cell Supplies', '2024-01-25 12:00:00', 0, 'https://www.veritastk.co.jp/products/images/100-0691-product-1.jpg');
--------

CREATE TABLE Inventory
(
  checkout_id INTEGER PRIMARY KEY,
  item_id INTEGER,
  user_id INTEGER,
  checkout_amount INT,
  checkout_date DATETIME,
  FOREIGN KEY (item_id) REFERENCES Supplies(item_id),
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);