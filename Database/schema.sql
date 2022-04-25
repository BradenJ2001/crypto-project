CREATE TABLE IF NOT EXISTS Users (
    userID       TEXT PRIMARY KEY,
    email        TEXT UNIQUE NOT NULL,
    username     TEXT UNIQUE NOT NULL,
    firstName    TEXT NOT NULL,
    lastName     TEXT NOT NULL,
    passwordHash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Cache (
    coin TEXT,
    predictionDate TEXT,
    predictedPrice REAL,

    PRIMARY KEY(coin, predictionDate)
);

CREATE TABLE IF NOT EXISTS Coin_Prices (
    coin TEXT,
    priceDate TEXT,
    highestPrice REAL,

    PRIMARY KEY (coin, priceDate)
);

CREATE TABLE IF NOT EXISTS Prediction_History (
    userID TEXT,
    coin TEXT,
    predictionDate TEXT,
    predictedPrice REAL,
    
    FOREIGN KEY (userID) REFERENCES Users(userID),
    PRIMARY KEY (userID, coin, predictionDate)
);