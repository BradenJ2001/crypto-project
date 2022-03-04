"use strict";
require("dotenv").config();

const redis = require("redis");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);

const express = require("express");
const app = express();
const userModel = require("./Models/userModel");

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
app.use(session(sessionConfig));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/register", (req, res) => { // create users
    if (!req.body.username || !req.body.password){
        return res.sendStatus(400);
    }

    const {username, password} = req.body;

    let created = userModel.createUser(username, password);

    if (!created){
        return res.sendStatus(409); // conflict with another username
    }

    res.sendStatus(201); // created
});

app.post("/login", async (req, res) => {
    if (!req.body.username || !req.body.password){
        return res.sendStatus(400);
    }

    const {username, password} = req.body;

    if (!userModel.getUserByUsername(username)){
        return res.sendStatus(400);
    }
    
    const {passwordHash} = user; // specifically takes passHash from user record.
    if (await argon2.verify(passwordHash, password)){
        req.session.regenerate((err) => {
            if (err){
                console.error(err);
                return res.sendStatus(500); // Internal Server Error
            }

            req.session.user = {};
            req.session.user.username = username;
            req.session.user.userID = user.userID;
            req.session.isLoggedIn = true;

            res.sendStatus(200);
        })
    } else{
        res.sendStatus(400);
    }
});

app.delete("/users/:username", (req, res) => {
    if (!req.session.isLoggedIn){
        return res.sendStatus(401); // unauthorized
    }
    const {username} = req.params; // get username from param given

    if (username !== req.session.user.username){ //user not same
        return res.sendStatus(403); // forbidden
    }
    if (!userModel.deleteUserByUsername(username)){ // user not exists
        return res.sendStatus(404);
    }

    res.sendStatus(200);
});

module.exports = app;