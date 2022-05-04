"use strict";

// const crypto = require("crypto");

function notFoundHandler(req, res, next) {
  res.status(404).render("error", {
    status: 404,
    message: `Couldn't find ${req.path}`,
    gifType: "404",
    title: "Not Found",
  });
}

// The error handler will
function productionErrorHandler(err, req, res, next) {
  res.status(500).render("error", {
    status: 500,
    message: `The server broke! We're working on it!`,
    gifType: "500",
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
