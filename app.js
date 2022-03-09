"use strict";
require("dotenv").config();

const redis = require("redis");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);

// Controllers
const userController = require("./Controllers/userController");

// App creation.
const express = require("express");
const app = express();

app.use(express.static("Public", {
    index: "index.html",
    extensions: ['html']
}));

const sessionConfig = {
    store: new RedisStore({ client: redis.createClient() }),
    secret: process.env.COOKIE_SECRET, 
    resave: false,
    saveUninitialized: false,
    name: "session", // now it is just a generic name
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
    }
  };
  
app.use(session(sessionConfig)); // Enable session management
app.use(express.json());         // Enables JSON parsing
app.use(express.urlencoded({ extended: false }));

// Endpoints
app.post("/register", userController.registerUser);
app.post("/login", userController.login);
app.delete("/users/:username", userController.deleteUser);

module.exports = app;