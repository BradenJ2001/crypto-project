"use strict";
require("dotenv").config();

const express = require("express");
const app = express();
const userModel = require("./Models/userModel");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

module.exports = app;