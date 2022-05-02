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

function cachePrediction(coin, date, price) {
  const sql = `
  INSERT INTO Cache
  VALUES (@coin, @date, @price)
  `;

  const stmt = db.prepare(sql);
  let inserted;

  try {
    stmt.run({
      coin,
      date,
      price,
    });
    inserted = true;
  } catch (err) {
    inserted = false;
    console.error(err);
  }

  return inserted;
}

function checkPrediction(coin, date) {
  const sql = `
  SELECT predictedPrice
  FROM Cache
  WHERE coin = @coin AND predictionDate = @date
  `;

  const stmt = db.prepare(sql);
  const prediction = stmt.get({
    coin,
    date,
  });

  return prediction;
}

function getPredictionHistory(id) {
  const sql = `
    SELECT *
    FROM Prediction_History
    WHERE userID=@id`;

  const stmt = db.prepare(sql);
  const history = stmt.all({ id });

  return history;
}

function storeUserPredictions(userID, coin, date, price) {
  const sql = `
  INSERT OR IGNORE INTO Prediction_History
  VALUES (@userID, @coin, @date, @price)
  `;

  const stmt = db.prepare(sql);
  let inserted;

  try {
    stmt.run({
      userID,
      coin,
      date,
      price,
    });
    inserted = true;
  } catch (err) {
    inserted = false;
    console.error(err);
  }

  return inserted;
}

module.exports = {
  createUser,
  getUserByUsername,
  getUserByID,
  cachePrediction,
  checkPrediction,
  storeUserPredictions,
  getPredictionHistory,
};
