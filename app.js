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
const crypto = require("crypto");
// const CoinMarketCap = require("coinmarketcap-api");

/*************************************
 * Create App
 *************************************/
const express = require("express");
const app = express();

const helmet = require("helmet");
const isDevelopment =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";
var nonce = crypto.randomBytes(16).toString("hex");

if (isProduction) {
  app.use((req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString("hex");
    next();
  });
  app.set("trust proxy", 1);
  app.use(
    helmet({
      // crossOriginResourcePolicy: false,
    })
  );

  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        "default-src": [
          "'self'",
          "'unsafe-inline'",
          "https://s3.tradingview.com",
          "https://s.tradingview.com",
        ],
        /* ... */
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "https://s3.tradingview.com",
          "https://s.tradingview.com",
          // (req, res) => `'nonce-${res.locals.nonce}'`,
        ],
      },
    })
  );
}

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
    sameSite: isProduction,
    secure: isProduction,
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
const brokenController = require("./Controllers/brokenController");

/*************************************
 * Require Validators
 *************************************/
const userValidator = require("./Validators/userValidator");

const {
  notFoundHandler,
  productionErrorHandler,
  catchAsyncErrors,
} = require("./utils/errorHandlers");
const pythonScript = require("./Machine_Learning/computePrediction");

/*************************************
 * Create Endpoints
 *************************************/
var coinNames = { btc: "Bitcoin", eth: "Ethereum", doge: "Doge Coin" };

// Simple endpoint that purposely throws an asynchronous exception
app.get("/breakAsync", catchAsyncErrors(brokenController.breakAsync));

/**********************************************
 * If logged in, go to dashboard.
 * If not already logged in, go to login page.
 * *******************************************/
app.get("/", userController.checkAuthenticated, async (req, res) => {
  res.render("dashboard", {
    loggedUsername: req.user.firstName,
  });
});

app.get("/index", userController.checkAuthenticated, (req, res) => {
  res.redirect("/");
});

app.get("/register", userController.checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
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
  catchAsyncErrors(userController.createNewUser)
);

app.get("/login", userController.checkNotAuthenticated, (req, res) => {
  res.render("login");
});

app.get("/:coin/coinChart", userController.checkAuthenticated, (req, res) => {
  console.log("NONCE", res.locals.nonce);
  res.render("coinChart", {
    coin: req.params.coin,
    coinName: coinNames[req.params.coin],
    nonce: res.locals.nonce,
  });
});

//update, pythonScript for searching tweet data and build boxes for tweets on website.
// Will this one endpoint("coinChart") account for all coin charts?
app.get(
  "/:coin/coinChart/predict",
  userController.checkAuthenticated,
  userController.checkPrediction,
  pythonScript.python,
  tweetController.getTweetsOfCoin,
  (req, res) => {
    res.render("prediction", {
      pred: res.locals.pred,
      coin: req.params.coin,
      tweets: res.locals.tweets,
    });
  }
);

app.get(
  "/history",
  userController.checkAuthenticated,
  userController.getPredictionHistory,
  (req, res) => {
    res.render("predictHistory", { history: res.locals.history });
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

app.use(notFoundHandler);
if (isProduction) {
  app.use(productionErrorHandler);
}

module.exports = app;
