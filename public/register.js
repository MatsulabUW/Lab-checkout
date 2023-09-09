/**
 * Dylan Renard and Semin Kim
 * CSE 154 AD and AA
 *
 * Final Project MVP
 *
 * Our project is to make a lab equipment checkout page
 * This file contains logic for our login page
 *
 */

"use strict";

(function() {
  const SIGNIN_API = '/index/signin';

  window.addEventListener('load', init);

  /**
   * init
   * initializes the webpage to respond to user sumbit button
   */
  function init() {
    qs('form').addEventListener('submit', (evt) => postSignIn(evt));
  }

  /**
   * postSignIn
   * @param {*} evt - the submit button is clicked
   * posts form information for registering a new user to API
   */
  function postSignIn(evt) {

    // console.log('postSignIn'); // debug statemetn
    evt.preventDefault();
    let username = id('username').value;
    let passwd = id('passwd').value;
    id('username').value = '';
    id('passwd').value = '';
    let params = new FormData();
    params.append('username', username);
    params.append('passwd', passwd);

    // console.log(params); // debug statement
    fetch(SIGNIN_API, {method: 'POST', body: params})
      .then(statusCheck)
      .then(res => res.json())
      .then(handleSignIn)
      .catch(handleError);
  }

  /**
   * handleSignIn
   * @param {*} data - form data for a new user
   */
  function handleSignIn(data) {

    // console.log('new user data: ' + data); // debug statemetn
    if (data.changes) {

      // console.log('signin successful'); // debug statemetn
      localStorage.removeItem("user_id");
      localStorage.setItem("user_id", data.user_id);
      window.location.replace("index.html");
    } else {
      throw new Error('Could not add new user. Please try agein.');
    }
  }

  /**
   * handleError
   * @param {str} err -given an error message
   * handles error message on front end of the page
   */
  function handleError(err) {
    let errmessage = gen('p');
    errmessage.textContent = err.message;
    errmessage.classList.add('errtxt');
    qs('h1').parentElement.insertBefore(errmessage, qs('h1').nextSibling);
  }

  // Class Helper Functions

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
   * @returns {HTMLElement} returns the element found by its id.
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
   * @returns {HTMLElement} returns all the elements found by its selector.
   */

  /*
   * function qsa(selector) {
   * return document.querySelectorAll(selector);
   * }
   */
})();