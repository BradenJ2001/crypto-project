"use strict";

const LocalStrategy = require("passport-local").Strategy;
const argon2 = require("argon2");
// const req = require("express/lib/request");
// var flash = require("connect-flash");

/*************************************
 * Require Models
 *************************************/
const userModel = require("./Models/userModel");

function initialize(passport) {
  const authenticateUser = async (username, password, done) => {
    // Get user from database
    const user = userModel.getUserByUsername(username);

    // Check if there were a record returned
    if (user) {
      // Check Password
      if (await argon2.verify(user.passwordHash, password)) {
        // req.flash("loggedUsername", user);
        return done(null, user, { message: user });
      } else {
        return done(null, false, {
          message: "Username or Password is not correct!",
        });
      }
    } else {
      return done(null, false, { message: "Username is not registered!" });
    }
  };

  passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },
      authenticateUser
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.userID);
  });

  passport.deserializeUser((id, done) => {
    const user = userModel.getUserByID(id);
    if (user) {
      return done(null, user);
    }
  });
}

module.exports = initialize;
