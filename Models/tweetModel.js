"use strict";

const db = require("./db");

function getTweets(coin) {
  let sql = `
    SELECT   DISTINCT *
    FROM     Tweets
    WHERE    tweet LIKE '%@coin%' OR tweet LIKE '%bitcoin%'
    ORDER BY Random()
    LIMIT 6;
    `;
  if (coin === "btc") {
    sql = `
            SELECT   DISTINCT *
            FROM     Tweets
            WHERE    tweet LIKE '%@coin%' OR tweet LIKE '%bitcoin%'
            ORDER BY Random()
            LIMIT 6;
        `;
  } else if (coin === "eth") {
    sql = `
            SELECT   DISTINCT *
            FROM     Tweets
            WHERE    tweet LIKE '%@coin%' OR tweet LIKE '%ethereum%'
            ORDER BY Random()
            LIMIT 6;
        `;
  } else if (coin === "doge") {
    sql = `
            SELECT   DISTINCT *
            FROM     Tweets
            WHERE    tweet LIKE '%@coin%' OR tweet LIKE '%dogecoin%'
            ORDER BY Random()
            LIMIT 6;
        `;
  }
  //SELECT * FROM table ORDER BY RANDOM() LIMIT 1;

  const stmt = db.prepare(sql);
  const tweets = stmt.all({ coin: coin });

  return tweets;
}

module.exports = {
  getTweets,
};
