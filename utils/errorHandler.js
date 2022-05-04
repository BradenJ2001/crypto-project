"use strict";

const crypto = require("crypto");

function notFoundHandler(req, res, next) {
  res.status(404).render("error", {
    n: crypto.randomInt(1, 5),
    status: 404,
    message: `Couldn't find ${req.path}`,
    gifDirectory: "notFoundGifs",
    title: "Not Found",
  });
}

// The error handler will
function productionErrorHandler(err, req, res, next) {
  res.status(500).render("error", {
    n: crypto.randomInt(1, 8),
    status: 500,
    message: `The server broke! We're working on it!`,
    gifDirectory: "errorGifs",
    title: "The server's on fire!",
  });
}

function catchAsyncErrors(fn) {
  return function (req, res, next) {
    return fn(req, res, next).catch(next);
  };
}

module.exports = {
  notFoundHandler,
  productionErrorHandler,
  catchAsyncErrors,
};
