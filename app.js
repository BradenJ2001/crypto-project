"use strict";
require("dotenv").config();

const redis = require("redis");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const passport = require("passport");
const flash = require("express-flash");
const methodOverride = require("method-override");
const path = require("path");
const { PythonShell } = require("python-shell");
const util = require("util");
const CoinMarketCap = require("coinmarketcap-api");

// tailwind

/*************************************
 * Create App
 *************************************/
const express = require("express");
const app = express();

/*************************************
 * Initialize Session
 *************************************/
const sessionConfig = {
  store: new RedisStore({ client: redis.createClient() }),
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  name: "session",
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8, // 8 hours
  },
};

/*************************************
 * Initialize Middleware
 *************************************/
app.use(flash());
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

/*************************************
 * Authentication Using Passport
 *************************************/
const initializePassport = require("./passportConfig");
initializePassport(passport);

app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Make Public folder accessible without defining explicit endpoints
app.use(
  "/public",
  express.static(path.join(__dirname, "Public"), {
    index: false,
    extensions: ["html"],
  })
);

/*************************************
 * Server Side Rendering
 *************************************/
app.set("view engine", "ejs");

/*************************************
 * Require Controllers
 *************************************/
const userController = require("./Controllers/userController.js");
const tweetController = require("./Controllers/tweetController.js");

/*************************************
 * Require Validators
 *************************************/
const userValidator = require("./Validators/userValidator");

const pythonScript = require("./Machine_Learning/computePrediction");
// const res = require("express/lib/response");

/*************************************
 * Create Endpoints
 *************************************/

// console.log("a", process.env.PATH);
// const spawn = require("child_process").spawn;
// const pythonProcess = spawn("/mnt/c/Users/Fadya/anaconda3/python.exe", [
//   "./Machine_Learning/computePrediction.py",
// ]);

// pythonProcess.stdout.on("data", (data) => {
//   console.log("python prediction: ", data.toString());
// });

/**********************************************
 * If logged in, go to dashboard.
 * If not already logged in, go to login page.
 * *******************************************/
app.get("/", userController.checkAuthenticated, async (req, res) => {
  // const result = await python();
  // console.log("endpoint", result);
  res.render("dashboard", {
    loggedUsername: req.user.firstName,
  });
});

app.get("/index", userController.checkAuthenticated, (req, res) => {
  res.redirect("/dashboard");
});

app.get("/register", userController.checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
  // res.redirect("/Public/register");
});

/***********************************************************************
 * Checks if not logged in,
 * Validates user; checks if username and email not in database(unique),
 * Creates the user.
 ***********************************************************************/
app.post(
  "/register",
  userController.checkNotAuthenticated,
  userValidator.validateUserCreationBody,
  userController.createNewUser
);

app.get("/login", userController.checkNotAuthenticated, (req, res) => {
  res.render("login");
  // res.redirect("/Public/login");
});

app.get("/coinChart", userController.checkAuthenticated, (req, res) => {
  res.render("coinChart");
});

//update, pythonScript for searching tweet data and build boxes for tweets on website.
// Will this one endpoint("coinChart") account for all coin charts?
app.get(
  "/coinChart/:coin/predict",
  userController.checkAuthenticated,
  pythonScript.python,
  tweetController.getTweetsOfCoin,
  (req, res) => {
    // const client = new CoinMarketCap("2002ef53-e500-4340-bfd8-dfd69bc31b5e");

    // client
    //   .getQuotes({ symbol: "BTC,ETH" })
    //   .then(console.log)
    //   .catch(console.error);
    res.render("prediction",  { "vars": [{"pred": res.locals.pred}, {"tweets": res.locals.tweets}] });
  }
);

/**********************************************************************
 * If /login endpoint is entered:
 *     If person 'logged in', goes to main page(aka dashboard).
 *     If person not logged in, goes to /login page.
 **********************************************************************/
app.post(
  "/login",
  userController.checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/logout", (req, res) => {
  req.logOut();
  req.flash("logOutSuccess", "Log Out Successful!");
  res.redirect("/login");
});

// app.delete("/users/:username", userController.deleteUser);

module.exports = app;
