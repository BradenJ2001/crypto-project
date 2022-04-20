"use strict";

const tweetModel = require("../Models/tweetModel");

function getTweetsOfCoin (req, res, next) {
    const coin = req.params.coin;
    const tweets = tweetModel.getTweets(coin);

    res.locals.tweets = tweets;

    next();
}

module.exports = {
    getTweetsOfCoin,
};