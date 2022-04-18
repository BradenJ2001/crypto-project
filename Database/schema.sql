CREATE TABLE IF NOT EXISTS Users (
    userID       TEXT PRIMARY KEY,
    email        TEXT UNIQUE NOT NULL,
    username     TEXT UNIQUE NOT NULL,
    firstName    TEXT NOT NULL,
    lastName     TEXT NOT NULL,
    passwordHash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Tweets (
    id       TEXT PRIMARY KEY NOT NULL,
    username TEXT NOT NULL,
    date     TEXT NOT NULL,
    tweet    TEXT NOT NULL,
    coin     TEXT NOT NULL
);