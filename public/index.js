/**
 * Dylan Renard and Semin Kim
 * CSE 154 AD and AA
 *
 * Final Project MVP
 *
 * Our project is to make a lab equipment checkout page
 * This file contains logic for our storefront page
 * Add to ur experiment -> metadata for lab work
 * Returned / Used
 * Equipment -> schedule
 */

"use strict";
(function() {

  const ITEMS_API = '/items';
  window.addEventListener('load', init);

  /**
   * init
   * Description
   */
  function init() {

    getItems();
    getUserInfo();

    id("supplies-btn").addEventListener('click', toggleSupplyEquip);
    id("equipments-btn").addEventListener('click', toggleSupplyEquip);
    id('equipment-filter').classList.add('hidden');
    id("product-details").classList.add("hidden");

    id('search-button').addEventListener("click", search);
    id("back-to-items").addEventListener('click', closeDetailedInfo);
    id("sign-out-btn").addEventListener('click', signOut);
  }

  /**
   * signOut
   * update local storage to sign a user out
   */
  function signOut() {
    localStorage.removeItem("user_id");
    localStorage.removeItem("cart");
    id('profile-pic').classList.toggle("hidden");
    id('inventory-btn').classList.toggle("hidden");
    id('sign-out-btn').classList.toggle("hidden");
    id('login-btn').classList.toggle("hidden");
    id('register-btn').classList.toggle("hidden");
    qs("nav p").classList.toggle("hidden");
  }

  /**
   * getUserInfo
   * one sentence description of what this method does
   * Are there any exceptions taken.
   */
  function getUserInfo() {
    let currUser = localStorage.getItem("user_id");
    if (currUser === "1") {
      let username = localStorage.getItem("username");
      let nametag = qs('nav p');
      nametag.classList.toggle("hidden");
      nametag.textContent = username;
      id('profile-pic').classList.toggle("hidden");
      let loginBox = id("login-box");
      for (let i = 0; i < loginBox.children.length; i++) {
        loginBox.children[i].classList.toggle("hidden");
      }
    }
  }

  /**
   * toggleSupplyEquip
   * Swaps between Supply and Equipment views
   */
  function toggleSupplyEquip() {
    let cards = qsa('#data-user-cards-container > .item');
    let supplyCards = qsa('.supply-card');
    let equipmentCards = qsa('.equipment-card');
    for (let i = 0; i < cards.length; i++) {
      cards[i].classList.toggle('hidden');
    }
    id('supply-filter').classList.toggle('hidden');
    id('supplies-btn').classList.toggle('not-chosen-tab');
    id('equipment-filter').classList.toggle('hidden');
    id('equipments-btn').classList.toggle('not-chosen-tab');
    qs("[data-search]").value = "";
    if (id('equipment-filter').classList.contains("hidden")) {
      supplyCards.forEach(card => {
        card.classList.remove("hidden");
      });
      equipmentCards.forEach(card => {
        card.classList.add("hidden");
      });
    } else {
      equipmentCards.forEach(card => {
        card.classList.remove("hidden");
      });
      supplyCards.forEach(card => {
        card.classList.add("hidden");
      });
    }
  }

  /**
   * getItems
   * Description of what it does
   * exceptions it responds to
   */
  function getItems() {
    fetch(ITEMS_API + '?itemType=Equipment')
      .then(statusCheck)
      .then(data => data.json())
      .then(addEquipments)
      .catch(handleError);
    fetch(ITEMS_API + '?itemType=Supplies')
      .then(statusCheck)
      .then(data => data.json())
      .then(addSupplies)
      .catch(handleError);
  }

  /**
   * addEquipments
   * One sentence description
   * @param {*} data - what is the data represented
   */
  function addEquipments(data) {
    let equipments = data.items;

    // console.log(equipments); // debug statement 🐞
    let userCards = id('data-user-cards-container');
    equipments.forEach(equipment => {
      let card = gen('div');
      card.classList.add('item');
      card.classList.add('equipment-card');
      card.classList.add('hidden');
      card.classList.add(formatString(equipment.type_));
      let name = gen('h3');
      name.textContent = equipment.item_name;
      name.addEventListener('click', () => {
        getDetailedInfo(equipment.item_id, 'Equipment');
      });
      let img = gen('img');
      img.src = equipment.image_url;
      img.alt = equipment.item_name;
      let button = gen('button');
      button.textContent = 'Add to Cart';
      button.classList.add('add-to-cart');
      button.addEventListener('click', () => {
        addItemToCart(equipment.item_id, 'Equipment');
      });
      card.appendChild(name);
      card.appendChild(img);
      genEquipmentStatus(equipment, card);
      card.appendChild(button);
      userCards.appendChild(card);
    });
  }

  /**
   * genEquipmentStatus
   * One sentence description of what this function does
   * @param {*} equipment - what does this represent
   * @param {*} card - what does this represent
   * Is anything returned?
   */
  function genEquipmentStatus(equipment, card) {
    let statusInfo = gen('p');
    statusInfo.classList.add('stock-info');
    if (equipment.item_status) {
      statusInfo.textContent = 'Available';
      statusInfo.classList.add('available');
    } else {
      statusInfo.textContent = 'Unavailable';
      statusInfo.classList.add('unavailable');

      /**
       * Display until when the item is unavailable.
       * Disable add to cart button
       */
    }
    card.appendChild(statusInfo);
  }

  /**
   * addSupplies
   * One sentence description of what this does.
   * @param {JSON} data - what does this represent?
   */
  function addSupplies(data) {
    let supplies = data.items;
    let userCards = id('data-user-cards-container');
    supplies.forEach(supply => {
      let card = gen('div');
      card.classList.add('item');
      card.classList.add('supply-card');
      card.classList.add(formatString(supply.category));
      let name = gen('h3');
      name.textContent = supply.item_name;
      name.addEventListener('click', () => {
        getDetailedInfo(supply.item_id, 'Supplies');
      });
      let img = gen('img');
      img.src = supply.image_url;
      img.alt = supply.item_name;
      let button = gen('button');
      button.textContent = 'Add to Cart';
      button.classList.add('add-to-cart');
      button.addEventListener('click', () => {
        addItemToCart(supply.item_id, 'Supplies');
      });
      card.appendChild(name);
      card.appendChild(img);
      genStockExpireInfo(supply, card);
      card.appendChild(button);
      userCards.appendChild(card);
    });
  }

  /**
   * genStockExpireInfo
   * One sentence describing what this does
   * @param {*} supply - what does this represent
   * @param {*} card - what does this represent
   */
  function genStockExpireInfo(supply, card) {
    let stockInfo = gen('p');
    stockInfo.classList.add('stock-info');
    stockInfo.textContent = supply.num_in_stock + ' Left';
    let expireInfo = gen('p');
    expireInfo.classList.add('expire-info');
    expireInfo.textContent = 'Expire: ' + supply.expire;
    card.appendChild(stockInfo);
    card.appendChild(expireInfo);
  }

  /**
   * getDetailedInfo
   * one sentence describing what this function does
   * @param {*} itemId - what does this represent
   * @param {*} itemType - what does this represent
   */
  function getDetailedInfo(itemId, itemType) {
    id('data-user-cards-container').classList.add('hidden');
    id('product-details').classList.remove('hidden');
    let api = ITEMS_API + '?itemType=Equipment&id=' + itemId;
    if (itemType === 'Supplies') {
      api = ITEMS_API + '?itemType=Supplies&id=' + itemId;
    }
    fetch(api)
      .then(statusCheck)
      .then(data => data.json())
      .then((data) => {
        displayDetailedInfo(data, itemType);
      })
      .catch(handleError);
  }

  /**
   * displayDetailedInfo
   * One sentence describinb what this does
   * @param {*} data - what does this represent
   * @param {*} itemType - what does this represent
   */
  function displayDetailedInfo(data, itemType) {
    let item = data.items[0];

    // console.log(item); // debug statement 🐞
    let name = qs('#product-details h3');
    name.textContent = item.item_name;
    let details = qs('#product-details section');
    removeAllChildNodes(details);
    let img = gen('img');
    img.src = item.image_url;
    img.alt = item.item_name;
    let description = gen('p');
    description.textContent = 'Description: ' + item.item_descrip;
    details.appendChild(img);
    details.appendChild(description);
    if (itemType === 'supply') {
      genStockExpireInfo(item, details);
    } else {
      genEquipmentStatus(item, details);
    }
    let button = gen('button');
    button.textContent = 'Add to Cart';
    button.classList.add('add-to-cart');
    button.addEventListener('click', () => {
      addItemToCart(item.item_id, itemType);
    });
    details.appendChild(button);
  }

  /**
   * addItemToCart
   * @param {str} id - id for current
   * @param {str} type - order type (equipment or supplies)
   */
  function addItemToCart(id, type) {
    if (localStorage.getItem("cart")) {
      let cartData = JSON.parse(localStorage.getItem("cart"));
      let itemExists = cartData.some(item => item.id === id && item.type === type);
      if (!itemExists) {
        cartData.push({id: id, type: type});
        localStorage.setItem('cart', JSON.stringify(cartData));
      }
    } else {
      let cartData = [{id: id, type: type}];
      localStorage.setItem("cart", JSON.stringify(cartData));
    }
  }

  /**
   * removeAllChildNodes
   * One sentence describing what this function does
   * @param {*} parent - what does this represent
   */
  function removeAllChildNodes(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }

  /**
   * closeDetailedInfo
   * What does this function do one sentence
   */
  function closeDetailedInfo() {
    id('data-user-cards-container').classList.remove('hidden');
    id('product-details').classList.add('hidden');
  }

  /**
   * Changes, for example 'Stem Cell Supplies' into 'stem-cell-supplies'
   * @param {text} text to format
   * @returns {String} formatted string
   */
  function formatString(text) {
    let texts = text.toLowerCase().split(' ');
    let res = '';
    for (let i = 0; i < texts.length; i++) {
      if (i === texts.length - 1) {
        res += texts[i];
      } else {
        res += texts[i] + '-';
      }
    }
    return res;
  }

  /**
   * Search function
   * parses cards displayed on the page
   * showing only ones that have characters that match the search query/
   */
  function search() {
    let cards = "";
    let supplyCards = qsa('.supply-card');
    let equipmentCards = qsa('.equipment-card');
    let searchInput = qs("[data-search]");

    // Front end search feature
    searchInput.addEventListener("input", query => {
      let equipmentShown = id('equipment-filter').classList;
      let bool = Object.values(equipmentShown).includes('hidden');
      if (bool) {

        // we are looking at supplies
        cards = supplyCards;
      } else { // we are looking at equipment
        cards = equipmentCards;
      }
      if (query.length !== 0) {
        const value = query.target.value.toLowerCase();
        cards.forEach(card => {
          let tempStr = card.querySelector("h3").innerText.toLowerCase();
          const isVisible = tempStr.includes(value);
          card.classList.toggle("hidden", !isVisible);
        });
      }
    });
  }

  /**
   * handleError
   * What does this function do
   * @param {*} err - what does this represent
   * @returns {String} error string
   */
  function handleError(err) {
    return err;
  }

  /**
   * Checks whether fetch() was successful or not.
   * Throws an error if !res.ok, else, returns res
   * @param {JSON} res JSON object
   * @returns {JSON} same res returned if fetch was successful
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Shortened function of 'createElement.'
   * @param {selector} selector - element that you want to create.
   * @returns {HTMLElement} returns the element created.
   */
  function gen(selector) {
    return document.createElement(selector);
  }

  /**
   * Shortened function of 'getElementByID.'
   * @param {id} id - id of the element.
   * @returns {HTMLElement} returns the element found by its id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Shortened function of 'querySelector'
   * @param {selector} selector - selector of the element
   * @returns {HTMLElement} returns the element found by its selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Shortened function of 'querySelectorAll'
   * @param {selector} selector - selector of the element
   * @returns {HTMLElement} returns the element found by its selector.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

})();