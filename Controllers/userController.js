"use strict";

const argon2 = require("argon2");

// Required model to manipulate database..
const userModel = require("../Models/userModel");

// register
function registerUser(req, res){ // create users
    if (!req.body.username || !req.body.password){
        return res.sendStatus(400);
    }

    const {username, password} = req.body;

    if (!userModel.createUser(username, password)){ // if not created
        return res.sendStatus(409); // conflict with another username
    }

    res.sendStatus(201); // created
}

// login async 
async function login(req, res){
    if (!req.body.username || !req.body.password){
        return res.sendStatus(400);
    }

    const {username, password} = req.body;

    if (!userModel.getUserByUsername(username)){ // if user non-existent
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
}

// delete user
function deleteUser(req, res){
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
}

module.exports = {
    registerUser,
    login,
    deleteUser,
};