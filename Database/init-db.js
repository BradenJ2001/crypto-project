"use strict";

require('dotenv').config()          // Don't forget to set up environment variables
const fs = require("fs");           // fs module grants file system access
const db = require("../Models/db"); // We need our db connection

// Now read the schema.sql file into a string
// It is ok to do this synchronously since this script executes before loading the server
const schemaString = fs.readFileSync(__dirname + "/schema.sql", "utf-8");

// Now just run the sql file
db.exec(schemaString);