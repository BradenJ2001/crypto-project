"use strict";

function breakSync(req, res) {
  throw new Error("Simon says: 'Break it!'");
}

async function breakAsync(req, res) {
  const brokenPromise = new Promise((resolve, reject) =>
    reject("Simon says: 'Break it...asynchronously!")
  );
  await brokenPromise;
}

module.exports = {
  breakSync,
  breakAsync,
};
