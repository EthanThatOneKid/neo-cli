// Dependencies
const fs = require('fs');

// Main Process
const dailies = {},
      fileNames = fs.readdirSync(__dirname);
for (let fileName of fileNames) {
  const fileNameNoExt = fileName.split(".").shift();
  if (fileNameNoExt !== "index") {
    dailies[fileNameNoExt] = require(`./${fileName}`);
  }
}

// Export
module.exports = dailies;