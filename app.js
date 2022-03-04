"use strict";
require("dotenv").config();

const express = require("express");
const app = express();
const userModel = require("./Models/userModel");

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
        res.sendStatus(200);
    } else{
        res.sendStatus(400);
    }
});

app.delete("/users/:username", (req, res) => {
    const {username} = req.params; // get username from param given

    if (!userModel.deleteUserByUsername(username)){
        return res.sendStatus(404);
    }

    res.sendStatus(200);
});

module.exports = app;