"use strict";
require("dotenv").config();

const app = require("./app");

const isProduction = process.env.NODE_ENV === "production";

app.listen(process.env.PORT, () => {
  const BLUE = "\u001b[34;1m";
  const GREEN = "\u001b[32;1m";
  const RESET = "\u001b[0m";

  let mode = process.env.NODE_ENV || "development";

  const color = isProduction ? GREEN : BLUE;
  mode = `${color}${mode}${RESET}`;
  console.log(`Listening on port: ${process.env.PORT} in ${mode} mode`);
});
