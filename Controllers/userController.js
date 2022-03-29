"use strict";
const argon2 = require("argon2");

/*************************************
 * Require Models
 *************************************/
const userModel = require("../Models/userModel");

// Create new user
async function createNewUser(req, res) {
  const { email, username, firstName, lastName, password } = req.body;

  const created = await userModel.createUser(
    email,
    username,
    firstName,
    lastName,
    password
  );

  // account was succesfully created
  if (created) {
    req.flash("accountCreated", "Account Created Successfully");
    return res.status(201).redirect("/login");
  } else {
    const conflictedUser = userModel.getUserByUsername(username);

    if (conflictedUser) {
      req.flash("usernameConflict", "Username already taken");
    } else {
      req.flash("emailConflict", "Email already taken");
    }

    res.redirect("/register");
  }
}

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }

  next();
}

module.exports = {
  createNewUser,
  // login,
  checkAuthenticated,
  checkNotAuthenticated,
};