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
  const CHECKOUT_API = '/inventory/checkout';
  const History_API = '/inventory/history';
  window.addEventListener('load', init);

  /**
   * init
   * Description
   */
  function init() {
    getUserInfo();
    getCartInfo();
    qs('h1').addEventListener("click", backToHome);
    id("sign-out-btn").addEventListener('click', signOut);
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
      nametag.textContent = username;
    }
  }

  /**
   * Get current cart info
   */
  function getCartInfo() {
    let cartData = JSON.parse(localStorage.getItem("cart"));
    cartData.forEach(item => {
      getEachItemInfo(item.id, item.type);
    });
  }

  /**
   * getEachItemInfo
   * grabs a specific
   * @param {*} itemId - what does this represent
   * @param {*} itemType - what does this represent
   */
  function getEachItemInfo(itemId, itemType) {
    let api = ITEMS_API + '?itemType=Equipment&id=' + itemId;
    if (itemType === 'Supplies') {
      api = ITEMS_API + '?itemType=Supplies&id=' + itemId;
    }
    fetch(api)
      .then(statusCheck)
      .then(data => data.json())
      .then((data) => {
        handleItemInfo(data, itemType);
      })
      .catch(handleError);
  }

  /**
   * handleItemInfo
   * Adds item info to the inventory with input boxes (how many to check out a supply,
   * how long to rent an equipment)
   * @param {Object} data data of each item
   * @param {string} itemType Type of an item ('Equipment' or 'Supplies')
   */
  function handleItemInfo(data, itemType) {
    let inventory = id('inventory-container');
    let itemContainer = gen('div');
    let itemInfo = gen('h3');
    let item = data.items[0];
    let inputForm = undefined;
    if (itemType === "Supplies") { // item is a Supply
      itemInfo.textContent = item.item_name + " (In Stock: " + item.num_in_stock + ")";
      inputForm = setForm(item.item_id, item.num_in_stock, itemType);
    } else {
      if (item.item_status) {
        itemInfo.textContent = item.item_name;
        inputForm = setForm(item.item_id, -1, itemType);
      }
    }
    if (inputForm !== undefined) {
      let removeBtn = gen('button');
      removeBtn.textContent = 'X';
      removeBtn.addEventListener('click', () => {
        removeItemFromCart(itemContainer, item.item_id, itemType);
      });
      itemContainer.appendChild(itemInfo);
      itemContainer.appendChild(inputForm);
      itemContainer.appendChild(removeBtn);
      inventory.appendChild(itemContainer);
    }
  }

  /**
   * setForm
   * Sets up the add to cart form on the inventory page
   * @param {*} itemId - an item's specific id
   * @param {*} stock - the number of that item in stock
   * @param {*} itemType -
   * @returns
   */
  function setForm(itemId, stock, itemType) {
    let form = gen('form');
    let submitBtn = gen('button');
    submitBtn.textContent = 'Submit';
    let label = gen('p');
    let input = gen('input');
    input.type = 'number';
    input.min = 1;
    input.value = 1;
    if (itemType === 'Supplies') {
      input.class = 'supplies-form';
      input.name = 'quantity';
      input.max = stock;
      label.textContent = 'How many: ';
      form.appendChild(label);
      form.appendChild(input);
    } else {
      input.class = 'equipment-form';
      input.name = 'duration';
      label.textContent = 'How long: ';
      form.appendChild(label);
      form.appendChild(input);
    }
    form.addEventListener('submit', (evt) => {
      submitInventory(evt, itemId, itemType, input.value, localStorage.getItem("user_id"));
    });
    form.appendChild(submitBtn);
    return form;
  }

  /**
   * submitInventory
   * submits a cart purchase to inventory
   * @param {*} evt - submit button clicked
   * @param {*} itemId - name of the item
   * @param {*} type - supplies or equipment
   * @param {*} input - corresponds to supplies or equipment update info
   * @param {*} userId - which user is making the request
   */
  function submitInventory(evt, itemId, type, input, userId) {
    evt.preventDefault();
    let api = CHECKOUT_API + '?itemType=' + type + '&itemId=' + itemId +
    '&userId=' + userId + '&inputVal=' + input;
    fetch(api)
      .then(statusCheck)
      .then(addHistory)
      .catch(handleError);
  }

  /**
   * History page
   * To be implemented
   */
  function addHistory() {
    fetch(History_API)
      .then(statusCheck)
      .then(data => data.json())
      .then((data) => {
        viewHistory(data);
      })
      .catch(handleError);
  }

  /**
   * viewHistory
   * A function called whenever the user pulls up the inventory page
   * To be implemented
   */

  function viewHistory(data) {
    let history = id('history-container');
    let log = gen('p');
    log.textContent = JSON.parse(data);
    history.appendChild(log);
  }

  /**
   * removeItemFromCart
   * removes cards if deleted
   * @param {*} itemContainer - the invetory page
   * @param {*} itemId - the name of the item
   * @param {*} itemType - supplies or equipment
   */
  function removeItemFromCart(itemContainer, itemId, itemType) {
    let inventory = id('inventory-container');
    inventory.removeChild(itemContainer);
    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    let index = cartItems.findIndex(item => item.id === itemId && item.type === itemType);
    if (index !== -1) {
      cartItems.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }

  /**
   * backToHome
   * returns user back to index.html when h1 element is clicked
   */
  function backToHome() {
    window.location.replace("index.html");
  }

  /**
   * signOut
   * update local storage to sign a user out
   */
  function signOut() {
    localStorage.removeItem("user_id");
    window.location.replace("index.html");
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

})();