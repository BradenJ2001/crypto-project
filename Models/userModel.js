"use strict";
const db = require("./db");
const crypto = require("crypto");

async function createUser(username, password){
    const UserID = crypto.randomUUID();
    const hash = await argon2.hash(password);

    const sql = `INSERT INTO Users values (@userID, @username, @passwordHash)`;

    const stmt = db.prepare(sql);

    try{
        stmt.run({
             "userID": userID, 
             "username": username, 
             "passwordHash": hash
            });
        return true;
    }catch(err){
        console.error(err);
        return false;
    }
}

function getUserByUsername(username){
    const sql = `SELECT * FORM Users WHERE username = @username`;

    const stmt = db.prepare(sql);
    const record = stmt.get({"username": username});

    return record; // may be undefined
}

function deleteUserByUsername (username){
    const sql = `DELETE FROM Users WHERE username = @username`;

    const stmt = db.prepare(sql);
    stmt.run({"username": username});
}

module.exports = {
    createUser,
    getUserByUsername,
    deleteUserByUsername
};