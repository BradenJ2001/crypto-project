"use strict";
const spawn = require("child_process").spawn;

/*************************************
 * Require Models
 *************************************/
const userModel = require("../Models/userModel");

async function python(req, res, next) {
  // don't spawn python process if cache is valid
  if (!res.locals.validPrediction) {
    let dataStream = "";
    let result = "";
    const promise = await new Promise((resolve, reject) => {
      const pythonProcess = spawn("python3", [
        "./Machine_Learning/computePrediction.py",
        "-u",
        `${req.params.coin}`,
      ]);

      pythonProcess.stdout.on("data", (data) => {
        console.log("python prediction: ", data.toString());
        dataStream += data.toString();
        resolve(dataStream);
      });

      pythonProcess.stderr.on("data", (err) => {
        console.log(String(err));
      });
    });

    res.locals.pred = dataStream;

    // cache prediction
    const date = new Date().toISOString().split("T")[0];
    const cache = userModel.cachePrediction(
      req.params.coin,
      date,
      parseFloat(dataStream)
    );
    if (!cache) {
      console.log("\nError while caching!\n");
    }

    // store user's prediction
    let dateTomorrow = new Date();
    dateTomorrow.setDate(dateTomorrow.getDate());
    dateTomorrow = dateTomorrow.toISOString().split("T")[0];
    const stored = userModel.storeUserPredictions(
      req.user.userID,
      req.params.coin,
      dateTomorrow,
      parseFloat(dataStream)
    );
    if (!stored) {
      console.log("\nERROR WHILE STORING USER'S PREDICTION\n");
    }
  } else {
    console.log("DATA ALREADY IN CACHE ... SKIPPING PYTHON SPAWN");

    // store user's prediction
    let dateTomorrow = new Date();
    dateTomorrow.setDate(dateTomorrow.getDate());
    dateTomorrow = dateTomorrow.toISOString().split("T")[0];
    const stored = userModel.storeUserPredictions(
      req.user.userID,
      req.params.coin,
      dateTomorrow,
      parseFloat(res.locals.validPrediction)
    );
    if (!stored) {
      console.log("\nERROR WHILE STORING USER'S PREDICTION\n");
    }
  }

  next();
}

module.exports = {
  python,
};
