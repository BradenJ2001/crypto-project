CREATE TABLE IF NOT EXISTS Users (
    userID       TEXT PRIMARY KEY,
    email        TEXT UNIQUE NOT NULL,
    username     TEXT UNIQUE NOT NULL,
    firstName    TEXT NOT NULL,
    lastName     TEXT NOT NULL,
    passwordHash TEXT NOT NULL
);