"use strict";
const spawn = require("child_process").spawn;

async function python(req, res, next) {
  let dataStream = "";
  let result = "";
  const promise = await new Promise((resolve, reject) => {
    const pythonProcess = spawn("python3", [
      "-u",
      "./Machine_Learning/computePrediction.py",
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

  //   dataStream = dataStream.;
  res.locals.pred = dataStream;
  next();
}

module.exports = {
  python,
};
