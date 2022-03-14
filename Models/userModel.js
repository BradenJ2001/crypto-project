"use strict";

const db = require("./db");
const crypto = require("crypto");
const argon2 = require("argon2");

async function createUser(email, username, firstName, lastName, password) {
  let created;
  const userID = crypto.randomUUID();
  const PasswordHash = await argon2.hash(password);

  const sql = `
  INSERT INTO Users 
  values (@userID, @email, @username, @firstName, @lastName, @passwordHash)
  `;

  const stmt = db.prepare(sql);

  try {
    stmt.run({
      userID: userID,
      email: email,
      username: username,
      firstName: firstName,
      lastName: lastName,
      passwordHash: PasswordHash,
    });
    created = true;
  } catch (err) {
    console.error(err);
    created = false;
  }

  return created;
}

function getUserByUsername(username) {
  const sql = `
  SELECT * 
  FROM Users 
  WHERE username = @username
  `;

  const stmt = db.prepare(sql);
  const userRecord = stmt.get({ username: username });

  return userRecord; // may be undefined
}

function getUserByID(id) {
  const sql = `
  SELECT * 
  FROM Users 
  WHERE userID = @id
  `;

  const stmt = db.prepare(sql);
  const userRecord = stmt.get({ id });

  return userRecord; // may be undefined
}

// function deleteUserByUsername(username) {
//   const sql = `DELETE FROM Users WHERE username = @username`;

//   const stmt = db.prepare(sql);
//   stmt.run({ username: username });
// }

module.exports = {
  createUser,
  getUserByUsername,
  getUserByID,
};
