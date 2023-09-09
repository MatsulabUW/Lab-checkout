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
  const LOGIN_API = '/index/login';

  window.addEventListener('load', init);

  /**
   * init
   * initializes webpage to listen for form submission
   */
  function init() {

    // console.log(qs('form')); // debug statement
    qs('form').addEventListener('submit', (evt) => postLogIn(evt));
  }

  /**
   * postLogin
   * @param {*} evt - a submit button is clicked on a login form
   * posts Login information to API
   */
  function postLogIn(evt) {

    // console.log('postLogIn'); // debug statement
    evt.preventDefault();
    let username = id('username').value;
    let passwd = id('passwd').value;
    id('username').value = '';
    id('passwd').value = '';
    let params = new FormData();
    params.append('username', username);
    params.append('passwd', passwd);

    // console.log(params); // debug statement
    fetch(LOGIN_API, {method: 'POST', body: params})
      .then(statusCheck)
      .then(res => res.json())
      .then(handleLogIn)
      .catch(handleError);
  }

  /**
   * handleLogin
   * @param {*} data - Login Form data
   * checks DB to see if entered info matches a field in user DB
   */
  function handleLogIn(data) {
    if (data) {
      // console.log('login successful'); // debug statement
      localStorage.removeItem("user_id");
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("username", data.username);
      window.location.replace("index.html");
    } else {
      throw new Error('Incorrect username or password. Please try again.');
    }
  }

  /**
   * handleError
   * @param {*} err - given an error object
   * Provides frontend error message to user
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
   *  function qsa(selector) {
   *  return document.querySelectorAll(selector);
   * }
   */
})();